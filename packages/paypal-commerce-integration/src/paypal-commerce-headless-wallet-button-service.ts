import { isNil, omitBy } from 'lodash';

import { GraphQLRequestOptions } from '@bigcommerce/checkout-sdk/headless-wallet-button-integration';
import {
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceRequestSender from './paypal-commerce-request-sender';
import PayPalCommerceScriptLoader from './paypal-commerce-script-loader';
import {
    PayPalButtonStyleOptions,
    PayPalCommerceInitializationData,
    PayPalSDK,
    StyleButtonColor,
    StyleButtonLabel,
    StyleButtonShape,
} from './paypal-commerce-types';

export default class PaypalCommerceHeadlessWalletButtonService {
    private paypalSdk?: PayPalSDK;

    constructor(
        private paypalCommerceRequestSender: PayPalCommerceRequestSender,
        private paypalCommerceScriptLoader: PayPalCommerceScriptLoader,
    ) {}

    /**
     *
     * PayPalSDK methods
     *
     */
    async loadPayPalSdk(
        paymentMethod: PaymentMethod<PayPalCommerceInitializationData>,
        providedCurrencyCode: string,
        initializesOnCheckoutPage?: boolean,
        forceLoad?: boolean,
    ): Promise<PayPalSDK | undefined> {
        this.paypalSdk = await this.paypalCommerceScriptLoader.getPayPalSDK(
            paymentMethod,
            providedCurrencyCode,
            initializesOnCheckoutPage,
            forceLoad,
        );

        return this.paypalSdk;
    }

    getPayPalSdkOrThrow(): PayPalSDK {
        if (!this.paypalSdk) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.paypalSdk;
    }

    /**
     *
     * Payment submitting and tokenizing methods
     *
     */
    async proxyTokenizationPayment(cartId: string, orderId?: string): Promise<void> {
        if (!orderId) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        const redirectUrl = await this.paypalCommerceRequestSender.getRedirectToCheckoutUrl(
            cartId,
            orderId,
        );

        window.location.assign(redirectUrl);
    }

    async createPaymentOrderIntent(
        providerId: string,
        cartId: string,
        options?: GraphQLRequestOptions,
    ): Promise<string> {
        const { orderId } = await this.paypalCommerceRequestSender.createPaymentOrderIntent(
            providerId,
            cartId,
            options,
        );

        return orderId;
    }

    /**
     *
     * Buttons style methods
     *
     */
    getValidButtonStyle(style?: PayPalButtonStyleOptions): PayPalButtonStyleOptions {
        const { color, height, label, shape } = style || {};

        const validStyles = {
            color: color && StyleButtonColor[color] ? color : undefined,
            height: this.getValidHeight(height),
            label: label && StyleButtonLabel[label] ? label : undefined,
            shape: shape && StyleButtonShape[shape] ? shape : undefined,
        };

        return omitBy(validStyles, isNil);
    }

    getValidHeight(height?: number): number {
        const defaultHeight = 40;
        const minHeight = 25;
        const maxHeight = 55;

        if (!height || typeof height !== 'number') {
            return defaultHeight;
        }

        if (height > maxHeight) {
            return maxHeight;
        }

        if (height < minHeight) {
            return minHeight;
        }

        return height;
    }

    /**
     *
     * Utils methods
     *
     */
    removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            // For now this is a temporary solution, further removeElement method will be removed
            element.style.display = 'none';
        }
    }
}
