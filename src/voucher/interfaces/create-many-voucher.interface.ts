export interface ICreateManyVoucher {
  customerId: string;
  codeLength: number;
  count: number;
  discountPercentage: number;
  expiresAt: string;
}
