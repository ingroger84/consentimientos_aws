export class RequestPlanChangeDto {
  planId: string;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  price: number;
  tenantName: string;
  tenantEmail: string;
  currentPlan?: string;
}
