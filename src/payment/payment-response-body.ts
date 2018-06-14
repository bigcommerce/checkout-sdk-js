export default interface PaymentResponseBody {
    status: string;
    id: string;
    avs_result: AvsResult | {};
    cvv_result: CvvResult | {};
    three_ds_result: ThreeDsResult | {};
    fraud_review: boolean;
    transaction_type: string;
    errors?: Array<{
        code: string;
        message: string;
    }>;
}

export interface AvsResult {
    code: string;
    message: string;
    street_match: string;
    postal_match: string;
}

export interface CvvResult {
    code: string;
    message: string;
}

export interface ThreeDsResult {
    acs_url: string;
    payer_auth_request: string;
    merchant_data: string;
    callback_url: string;
}
