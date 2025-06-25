import { isNil, omitBy } from 'lodash';

import {
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    GraphQLRequestOptions,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import PayPalCommerceScriptLoader from './paypal-commerce-script-loader';
import {
    PayPalButtonStyleOptions,
    PayPalCommerceInitializationData,
    PayPalSDK,
    StyleButtonColor,
    StyleButtonLabel,
    StyleButtonShape,
} from './paypal-commerce-types';

export default class PaypalCommerceWalletService {
    private paypalSdk?: PayPalSDK;

    constructor(
        private walletButtonIntegrationService: WalletButtonIntegrationService,
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

        const inputData = {
            paymentWalletData: {
                providerId: 'paypalcommerce',
                providerOrderId: orderId,
            },
            cartEntityId: cartId,
            queryParams: [
                { key: 'payment_type', value: 'paypal' },
                { key: 'action', value: 'set_external_checkout' },
                { key: 'provider', value: 'paypalcommerce' },
            ],
        };

        const response = await this.walletButtonIntegrationService.getRedirectToCheckoutUrl(
            inputData,
        );

        if (!response.body.redirectUrls?.externalCheckoutUrl) {
            throw new Error('Failed to redirection to checkout page');
        }

        window.location.assign(response.body.redirectUrls.externalCheckoutUrl);
    }

    async createPaymentOrderIntent(
        providerId: string,
        cartId: string,
        options?: GraphQLRequestOptions,
    ): Promise<string> {
        const inputData = {
            cartEntityId: cartId,
            paymentWalletEntityId: providerId,
        };
        const response = await this.walletButtonIntegrationService.createPaymentOrderIntent(
            inputData,
            options,
        );

        return response.body.orderId;
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
