export default interface PaymentResponse<T = any> {
    data: T;
    headers: {[key: string]: any};
    status: number;
    statusText: string;
}
