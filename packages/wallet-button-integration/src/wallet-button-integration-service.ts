import { Response } from '@bigcommerce/request-sender';

import {
    AddressRequestBody,
    BillingAddressResponse,
    BillingAddressUpdateRequestBody,
} from './billing/billing-address';
import BillingAddressRequestSender from './billing/billing-address-request-sender';
import {
    CreateRedirectToCheckoutHandoffResponseBody,
    CreateRedirectToCheckoutResponseBody,
    RedirectToCheckoutUrlInputData,
} from './checkout/checkout';
import { CheckoutRequestSender } from './checkout/checkout-request-sender';
import { GraphQLRequestOptions } from './graphql-request-options';
import {
    CreatePaymentOrderIntentInputData,
    CreatePaymentOrderIntentResponseBody,
} from './payment/payment';
import { PaymentRequestSender } from './payment/payment-request-sender';
import {
    ShippingAddressUpdateOptions,
    ShippingAddressUpdateResult,
} from './shipping/shipping-address';
import ShippingAddressRequestSender from './shipping/shipping-address-request-sender';

export default class WalletButtonIntegrationService {
    constructor(
        private graphQLEndpoint: string,
        private billingAddressRequestSender: BillingAddressRequestSender,
        private shippingAddressRequestSender: ShippingAddressRequestSender,
        private paymentRequestSender: PaymentRequestSender,
        private checkoutRequestSender: CheckoutRequestSender,
    ) {}

    async addBillingAddress(
        checkoutId: string,
        address: AddressRequestBody,
        options?: GraphQLRequestOptions,
    ): Promise<Response<BillingAddressResponse>> {
        return this.billingAddressRequestSender.addBillingAddress(
            this.graphQLEndpoint,
            checkoutId,
            address,
            options,
        );
    }

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

    async updateShippingAddress(
        checkoutId: string,
        address: AddressRequestBody,
        options?: ShippingAddressUpdateOptions,
    ): Promise<ShippingAddressUpdateResult | undefined> {
        return this.shippingAddressRequestSender.updateShippingAddress(
            this.graphQLEndpoint,
            checkoutId,
            address,
            options,
        );
    }

    async selectShippingOption(
        checkoutId: string,
        consignmentEntityId: string,
        shippingOptionEntityId: string,
        options?: GraphQLRequestOptions,
    ): Promise<ShippingAddressUpdateResult> {
        return this.shippingAddressRequestSender.selectShippingOption(
            this.graphQLEndpoint,
            checkoutId,
            consignmentEntityId,
            shippingOptionEntityId,
            options,
        );
    }

    async createPaymentOrderIntent(
        inputData: CreatePaymentOrderIntentInputData,
        intentTypename?: string,
        options?: GraphQLRequestOptions,
    ): Promise<Response<CreatePaymentOrderIntentResponseBody>> {
        return this.paymentRequestSender.createPaymentOrderIntent(
            this.graphQLEndpoint,
            inputData,
            intentTypename,
            options,
        );
    }

    async getRedirectToCheckoutUrl(
        inputData: RedirectToCheckoutUrlInputData,
        options?: GraphQLRequestOptions,
    ): Promise<Response<CreateRedirectToCheckoutResponseBody>> {
        return this.checkoutRequestSender.getRedirectToCheckoutUrl(
            this.graphQLEndpoint,
            inputData,
            options,
        );
    }

    /**
     * Same mutation as getRedirectToCheckoutUrl, but also requests externalCheckoutHandoff.
     * Only for strategies whose payment data cannot be passed in a plain redirect.
     */
    async getRedirectToCheckoutHandoff(
        inputData: RedirectToCheckoutUrlInputData,
        options?: GraphQLRequestOptions,
    ): Promise<Response<CreateRedirectToCheckoutHandoffResponseBody>> {
        return this.checkoutRequestSender.getRedirectToCheckoutHandoff(
            this.graphQLEndpoint,
            inputData,
            options,
        );
    }
}
