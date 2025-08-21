Tới đây là **sơ đồ luồng lỗi** (error flow) cho API `getAllRewardHistory`. Mình chia theo các nhánh lỗi thường gặp: **validate input**, **xử lý truy vấn**, **DB/infra**, và **semantics** (trường hợp hợp lệ nhưng rỗng).

```
Client (FE)
  |
  | 1) GET /reward-history?page=?&limit=?&search=?
  v
API Route / Controller
  |
  |-- Validate query:
  |     - page, limit: phải là số nguyên dương
  |     - limit <= MAX_LIMIT (vd 100)
  |     - search: trim() và giới hạn độ dài (vd <= 200)
  |     - Nếu FAIL -> 400 Bad Request (hoặc 422 Unprocessable Entity)
  |         body: { errorCode:"VALIDATION_ERROR", details:[...] }
  |     - Nếu PASS -> gọi service
  v
Service Layer (getAllRewardHistory)
  |
  |-- Tính offset = (page-1)*limit
  |-- Lập whereClause:
  |     - Nếu search rỗng -> KHÔNG áp where
  |     - Nếu có search -> reason ILIKE %search%
  |
  |-- Thực thi song song 2 truy vấn:
  |     Q1: SELECT ... ORDER BY date DESC LIMIT ? OFFSET ?
  |     Q2: SELECT COUNT(*)
  |
  |-- Lỗi phát sinh có thể gặp:
  |     A) whereClause = undefined mà vẫn truyền vào .where(whereClause)
  |        -> ORM có thể throw TypeError / SQL build error
  |        -> Catch -> ném ra APP_ERROR "QUERY_BUILD_ERROR"
  |
  |     B) DB lỗi kết nối / timeout
  |        -> Catch -> 503 Service Unavailable (hoặc 500 nếu nội bộ)
  |           body: { errorCode:"DB_UNAVAILABLE", retryable:true }
  |
  |     C) SQL timeout / deadlock
  |        -> Catch -> 504 Gateway Timeout (nếu qua gateway) hoặc 500
  |           body: { errorCode:"DB_TIMEOUT", retryable:true }
  |
  |-- Nếu truy vấn OK:
  |     - total = COUNT(*)
  |     - Nếu total = 0:
  |         -> 200 OK với data:[], total:0, totalPages:0
  |     - Nếu page > totalPages (và total > 0):
  |         -> Tùy chiến lược:
  |            (1) Trả 200 OK với data:[] (giữ currentPage)
  |            (2) Hoặc 400 BAD_REQUEST: "PAGE_OUT_OF_RANGE"
  |
  |-- Trả kết quả hợp lệ cho Controller
  v
API Route / Controller
  |
  |-- Serialize JSON + status code
  v
Client (FE)
  |
  |-- Render UI:
  |     - Nếu errorCode -> hiển thị toast/thông điệp phù hợp
  |     - Nếu data rỗng -> empty state + gợi ý nhập search khác
```

---

## Đề xuất chuẩn hoá lỗi (status + payload)

| Tình huống                           | HTTP status | errorCode               | Gợi ý message FE                           |
| ------------------------------------ | ----------- | ----------------------- | ------------------------------------------ |
| `page/limit` không hợp lệ            | 400 / 422   | `VALIDATION_ERROR`      | “Tham số không hợp lệ. Vui lòng thử lại.”  |
| `limit` quá lớn                      | 400         | `LIMIT_TOO_LARGE`       | “Số lượng mỗi trang vượt mức cho phép.”    |
| `search` quá dài                     | 400         | `SEARCH_TOO_LONG`       | “Từ khoá quá dài. Vui lòng rút gọn.”       |
| Lỗi build query (where undefined, …) | 500         | `QUERY_BUILD_ERROR`     | “Có lỗi nội bộ khi tạo truy vấn.”          |
| DB connection lỗi / tạm ngưng        | 503         | `DB_UNAVAILABLE`        | “Hệ thống đang bận. Vui lòng thử lại sau.” |
| DB timeout / deadlock                | 504 / 500   | `DB_TIMEOUT`            | “Hệ thống phản hồi chậm. Hãy thử lại.”     |
| Trang vượt phạm vi                   | 200 / 400   | `PAGE_OUT_OF_RANGE`(\*) | “Không còn dữ liệu cho trang này.”         |

> (\*) Tuỳ chính sách: hoặc trả 200 với `data: []`, hoặc trả 400 để FE điều chỉnh về trang cuối.

**Mẫu payload lỗi**

```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "Invalid query parameters",
  "details": [{ "field": "page", "issue": "Must be a positive integer" }]
}
```

---

## Gợi ý code cứng hoá luồng lỗi

### 1) Validate sớm ở Controller (Zod)

```ts
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().max(200).optional(),
});
```

### 2) Tránh `.where(undefined)`

```ts
const base = db.select().from(schema.rewardHistory);
const query = whereClause ? base.where(whereClause) : base;

const [data, total] = await Promise.all([
  query.orderBy(desc(schema.rewardHistory.date)).limit(limit).offset(offset),
  whereClause
    ? db
        .select({ count: sql`count(*)` })
        .from(schema.rewardHistory)
        .where(whereClause)
    : db.select({ count: sql`count(*)` }).from(schema.rewardHistory),
]);
```

### 3) Bọc lỗi DB

```ts
try {
  // ...thực thi query
} catch (err: any) {
  if (isDbTimeout(err))
    throw new AppError('DB_TIMEOUT', 503, { retryable: true });
  if (isConnErr(err))
    throw new AppError('DB_UNAVAILABLE', 503, { retryable: true });
  throw new AppError('QUERY_BUILD_ERROR', 500);
}
```

### 4) Xử lý page vượt phạm vi (tùy chính sách)

```ts
const totalPages = Math.ceil(totalNum / limit);
if (totalNum > 0 && page > totalPages) {
  // A: Trả rỗng nhưng 200
  return {
    data: [],
    total: totalNum,
    page,
    limit,
    totalPages,
    currentPage: page,
  };

  // B: Hoặc ném lỗi 400 để FE tự điều chỉnh
  // throw new AppError("PAGE_OUT_OF_RANGE", 400, { totalPages });
}
```

---

## Empty state & UX

- Khi `data: []` và có `search`: hiển thị thông điệp “Không tìm thấy kết quả cho ‘…’” + nút _Clear search_.
- Khi `data: []` và **không** có `search`: “Chưa có lịch sử reward.”
- Khi lỗi `DB_UNAVAILABLE`/`DB_TIMEOUT`: cho nút _Retry_; nếu là trang Admin, có thể auto-retry sau 3–5s.

---

Nếu bạn muốn, mình có thể **gói sẵn AppError class + middleware Express** để thống nhất error format và log chi tiết (kèm correlationId) cho toàn backend của bạn.
