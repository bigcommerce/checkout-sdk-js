export interface HostedFormManualOrderOptions {
    net_terms?: string;
    due_date?: string;
    reference?: string;
    send_now?: boolean;
}

export default interface HostedFormManualOrderData {
    paymentMethodId: string;
    paymentSessionToken: string;
    token?: string;
    options?: HostedFormManualOrderOptions;
}
