export interface HostedFormManualOrderOptions {
    net_terms?: string;
    reference?: string;
}

export default interface HostedFormManualOrderData {
    paymentMethodId: string;
    paymentSessionToken: string;
    token?: string;
    options?: HostedFormManualOrderOptions;
}
