export type EarnPointsDto = {
  amount: number;
  reason: string;
  metadata?: any;
  correlationId?: string;
};
export type AdminAdjustDto = {
  userId: string;
  delta: number;
  reason: string;
  metadata?: any;
  correlationId?: string;
};
