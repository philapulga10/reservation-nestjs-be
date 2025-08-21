Dưới đây là sơ đồ luồng dữ liệu (sequence) cho `getAllRewardHistory` – từ client đến DB và ngược lại.

```
Client (FE)
   |
   | 1) HTTP GET /reward-history?page=2&limit=10&search=bonus
   v
API Route / Controller
   |
   |--> Parse query: page=2, limit=10, search="bonus"
   |--> Gọi service: getAllRewardHistory({page, limit, search})
   v
Service Layer (getAllRewardHistory)
   |
   |--> Tính offset = (page-1)*limit
   |--> Lập whereClause:
   |       - Nếu có search => reason ILIKE '%bonus%'
   |       - Nếu không => undefined (không lọc)
   |
   |--> Promise.all([
   |        Q1: SELECT * FROM reward_history
   |            WHERE <whereClause?>
   |            ORDER BY date DESC
   |            LIMIT 10
   |            OFFSET 10,
   |        Q2: SELECT COUNT(*) FROM reward_history
   |            WHERE <whereClause?>
   |    ])
   |
   |--> Nhận kết quả:
   |       - data = bản ghi trang 2
   |       - total = tổng số bản ghi khớp điều kiện
   |--> Tính totalPages = ceil(total/limit)
   |--> Trả về object:
   |       { data, total, page, limit, totalPages, currentPage: page }
   v
API Route / Controller
   |
   |--> serialize JSON và res.status(200).json(...)
   v
Client (FE)
   |
   | 2) Nhận JSON, render UI:
   |     - danh sách lịch sử
   |     - phân trang (page, totalPages)
   v
UI hiển thị
```

### Ví dụ request / response

**Request**

```
GET /reward-history?page=2&limit=10&search=bonus
```

**Response**

```json
{
  "data": [
    /* 10 dòng trang 2, mới nhất trước */
  ],
  "total": 42,
  "page": 2,
  "limit": 10,
  "totalPages": 5,
  "currentPage": 2
}
```

### Ghi chú quan trọng

- `whereClause` chỉ được áp dụng khi `search` có giá trị hợp lệ (`trim()` ≠ rỗng).
- Dùng `Promise.all` để **chạy song song** 2 truy vấn (data + count) → nhanh hơn gọi tuần tự.
- Sắp xếp `desc(date)` đảm bảo bản ghi mới nhất hiển thị trước.

Nếu bạn muốn, mình vẽ thêm một **sơ đồ luồng lỗi** (khi DB lỗi, khi `page`/`limit` không hợp lệ, khi `search` rỗng) để bạn gắn vào tài liệu API nhé.
