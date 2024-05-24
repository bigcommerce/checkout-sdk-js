export class PaymentRequestTransformer {
    constructor() {
    }

    transform() {
        return {};
    }

    transformWithHostedFormData(
        values: any,
        data: any,
        nonce: string,
    ) {
        return {
            values,
            data,
            nonce
        };
    }

}