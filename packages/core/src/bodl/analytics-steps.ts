export enum AnalyticStepType {
    CUSTOMER = 'customer',
    SHIPPING = 'shipping',
    BILLING = 'billing',
    PAYMENT = 'payment',
}

export const AnalyticStepOrder: AnalyticStepType[] = [
    AnalyticStepType.CUSTOMER,
    AnalyticStepType.SHIPPING,
    AnalyticStepType.BILLING,
    AnalyticStepType.PAYMENT,
];
