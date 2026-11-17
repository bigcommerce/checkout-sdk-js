export default interface PaymentResponse<T = any> {
    data: T;
    headers: Record<string, any>;
    status: number;
    statusText: string;
}
