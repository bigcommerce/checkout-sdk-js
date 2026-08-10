import { Response } from '@bigcommerce/request-sender';
import { isNil, omitBy } from 'lodash';

import {
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    AddressRequestBody,
    BillingAddressResponse,
    GraphQLRequestOptions,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import {
    PayPalButtonStyleOptions,
    PayPalOrderDetails,
    PayPalSDK,
    StyleButtonColor,
    StyleButtonLabel,
    StyleButtonShape,
} from './paypal-types';

export interface PayPalWalletScriptLoader {
    getPayPalSDK(
        paymentMethod: PaymentMethod,
        currencyCode: string,
        storeLanguage?: string,
        initializesOnCheckoutPage?: boolean,
        forceLoad?: boolean,
    ): Promise<PayPalSDK>;
}

export default class PaypalCommerceWalletService {
    private paypalSdk?: PayPalSDK;

    constructor(
        private walletButtonIntegrationService: WalletButtonIntegrationService,
        private scriptLoader: PayPalWalletScriptLoader,
        private intentTypename = 'PayPalCommercePaymentWalletIntentData',
    ) {}

    /**
     *
     * PayPalSDK methods
     *
     */
    async loadPayPalSdk(
        paymentMethod: PaymentMethod,
        providedCurrencyCode: string,
        initializesOnCheckoutPage?: boolean,
        forceLoad?: boolean,
    ): Promise<PayPalSDK | undefined> {
        this.paypalSdk = await this.scriptLoader.getPayPalSDK(
            paymentMethod,
            providedCurrencyCode,
            undefined,
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
    async proxyTokenizationPayment(
        cartId: string,
        providerId: string,
        methodId: string,
        orderId?: string,
    ): Promise<void> {
        if (!orderId) {
            throw new MissingDataError(MissingDataErrorType.MissingOrderId);
        }

        const inputData = {
            paymentWalletData: {
                providerId,
                providerOrderId: orderId,
            },
            cartEntityId: cartId,
            queryParams: [
                { key: 'payment_type', value: 'paypal' },
                { key: 'action', value: 'set_external_checkout' },
                { key: 'provider', value: methodId },
                { key: 'order_id', value: orderId },
            ],
        };

        const response = await this.walletButtonIntegrationService.getRedirectToCheckoutUrl(
            inputData,
        );

        if (!response.body.redirectUrls?.externalCheckoutUrl) {
            throw new Error('Failed to redirection to checkout page');
        }

        window.location.assign(response.body.redirectUrls!.externalCheckoutUrl);
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
            this.intentTypename,
            options,
        );

        return response.body.orderId;
    }

    async addBillingAddress(
        cartId: string,
        address: AddressRequestBody,
        options?: GraphQLRequestOptions,
    ): Promise<Response<BillingAddressResponse>> {
        return this.walletButtonIntegrationService.addBillingAddress(cartId, address, options);
    }

    mapOrderDetailsToBillingAddress({ payer }: PayPalOrderDetails): AddressRequestBody {
        return {
            firstName: payer.name.given_name,
            lastName: payer.name.surname,
            company: '',
            address1: payer.address.address_line_1,
            address2: payer.address.address_line_2,
            city: payer.address.admin_area_2,
            email: payer.email_address,
            stateOrProvince: payer.address.admin_area_1 ?? '',
            stateOrProvinceCode: payer.address.admin_area_1 ?? '',
            countryCode: payer.address.country_code,
            postalCode: payer.address.postal_code,
            phone: payer.phone?.phone_number.national_number ?? '',
            shouldSaveAddress: false,
        };
    }

    /**
     *
     * Buttons style methods
     *
     */
    getValidButtonStyle(style: PayPalButtonStyleOptions = {}): PayPalButtonStyleOptions {
        const { color, height, label, shape } = style;

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
