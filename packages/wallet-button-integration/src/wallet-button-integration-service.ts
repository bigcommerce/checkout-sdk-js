import { Response } from '@bigcommerce/request-sender';

import { GraphQLRequestOptions } from './graphql-request-options';
import {
    CreatePaymentOrderIntentInputData,
    CreatePaymentOrderIntentResponseBody,
} from './payment/payment';
import { PaymentRequestSender } from './payment/payment-request-sender';

export default class WalletButtonIntegrationService {
    constructor(
        private graphQLEndpoint: string,
        private paymentRequestSender: PaymentRequestSender,
    ) {}

    async createPaymentOrderIntent(
        inputData: CreatePaymentOrderIntentInputData,
        options?: GraphQLRequestOptions,
    ): Promise<Response<CreatePaymentOrderIntentResponseBody>> {
        return this.paymentRequestSender.createPaymentOrderIntent(
            this.graphQLEndpoint,
            inputData,
            options,
        );
    }
}
