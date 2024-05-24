import { Response } from "@bigcommerce/request-sender";

export class PaymentRequestSender {
    private _client: any;

    constructor(client: any) {
        this._client = client;
    }

    submitPayment(payload: any): Promise<Response<any>> {
        console.log('submitPayment', payload, this._client);
        return Promise.resolve({} as Response<any>);
    }
}