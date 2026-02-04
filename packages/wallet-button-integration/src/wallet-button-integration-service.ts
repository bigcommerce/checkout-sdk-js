import { Response } from '@bigcommerce/request-sender';

import { BillingAddressResponse, BillingAddressUpdateRequestBody } from './billing/billing-address';
import BillingAddressRequestSender from './billing/billing-address-request-sender';
import { GraphQLRequestOptions } from './graphql-request-options';
import {
    CreatePaymentOrderIntentInputData,
    CreatePaymentOrderIntentResponseBody,
    CreateRedirectToCheckoutResponseBody,
    RedirectToCheckoutUrlInputData,
} from './payment/payment';
import { PaymentRequestSender } from './payment/payment-request-sender';

export default class WalletButtonIntegrationService {
    constructor(
        private graphQLEndpoint: string,
        private billingAddressRequestSender: BillingAddressRequestSender,
        private paymentRequestSender: PaymentRequestSender,
    ) {}

    async updateBillingAddress(
        checkoutId: string,
        address: BillingAddressUpdateRequestBody,
        options?: GraphQLRequestOptions,
    ): Promise<Response<BillingAddressResponse>> {
        return this.billingAddressRequestSender.updateBillingAddress(
            this.graphQLEndpoint,
            checkoutId,
            address,
            options,
        );
    }

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

    async getRedirectToCheckoutUrl(
        inputData: RedirectToCheckoutUrlInputData,
        options?: GraphQLRequestOptions,
    ): Promise<Response<CreateRedirectToCheckoutResponseBody>> {
        return this.paymentRequestSender.getRedirectToCheckoutUrl(
            this.graphQLEndpoint,
            inputData,
            options,
        );
    }
}
