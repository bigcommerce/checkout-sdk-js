import {
    guard,
    InvalidArgumentError,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    AddressRequestBody,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import GooglePayWalletGateway from './gateways/google-pay-wallet-gateway';
import GooglePayScriptLoader from './google-pay-script-loader';
import {
    GooglePayBaseCardPaymentMethod,
    GooglePayButtonOptions,
    GooglePayCardDataResponse,
    GooglePayCardPaymentMethod,
    GooglePayInitializationData,
    GooglePaymentsClient,
    GooglePayPaymentDataRequest,
    GooglePayTransactionInfo,
} from './types';

export default class GooglePayWalletService {
    private paymentsClient?: GooglePaymentsClient;
    private paymentDataRequest?: GooglePayPaymentDataRequest;

    constructor(
        private walletButtonIntegrationService: WalletButtonIntegrationService,
        private scriptLoader: GooglePayScriptLoader,
        private gateway: GooglePayWalletGateway,
    ) {}

    /**
     *
     * Google Pay SDK methods
     *
     */
    async initialize(
        paymentMethod: PaymentMethod<GooglePayInitializationData>,
        currencyCode: string,
        testMode: boolean,
        transactionInfo: GooglePayTransactionInfo,
    ): Promise<void> {
        this.paymentsClient = await this.scriptLoader.getGooglePaymentsClient(testMode);

        await this.gateway.initialize(paymentMethod, currencyCode);

        this.buildPaymentDataRequest(transactionInfo);
    }

    renderButton(
        containerId: string,
        options: Omit<GooglePayButtonOptions, 'allowedPaymentMethods'>,
    ): void {
        const container = document.querySelector<HTMLElement>(`#${containerId}`);

        if (!container) {
            return;
        }

        const button = this.getPaymentsClientOrThrow().createButton({
            ...options,
            allowedPaymentMethods: [this.getBaseCardPaymentMethod()],
        });

        container.appendChild(button);
    }

    async showPaymentSheet(): Promise<GooglePayCardDataResponse> {
        return this.getPaymentsClientOrThrow().loadPaymentData(this.getPaymentDataRequestOrThrow());
    }

    /**
     *
     * Payment submitting and tokenizing methods
     *
     */
    async createPaymentOrderIntent(cartId: string): Promise<string> {
        const { providerId, intentTypename } = this.gateway.getTokenizationConfig();

        const response = await this.walletButtonIntegrationService.createPaymentOrderIntent(
            {
                cartEntityId: cartId,
                paymentWalletEntityId: providerId,
            },
            intentTypename,
        );

        return response.body.orderId;
    }

    async addBillingAddress(cartId: string, address: AddressRequestBody): Promise<void> {
        await this.walletButtonIntegrationService.addBillingAddress(cartId, address);
    }

    async proxyTokenizationPayment(
        cartId: string,
        orderId: string,
        cardDataResponse: GooglePayCardDataResponse,
    ): Promise<void> {
        const { providerId, paymentType, methodId } = this.gateway.getTokenizationConfig();
        const { tokenizationData, info } = cardDataResponse.paymentMethodData;
        const nonce = btoa(tokenizationData.token);
        const cardInformation = { type: info.cardNetwork, number: info.cardDetails };

        const inputData = {
            paymentWalletData: {
                providerId,
                providerOrderId: orderId,
            },
            cartEntityId: cartId,
            queryParams: [
                { key: 'payment_type', value: paymentType },
                { key: 'action', value: 'set_external_checkout' },
                { key: 'provider', value: methodId },
                { key: 'nonce', value: nonce },
                { key: 'card_information', value: JSON.stringify(cardInformation) },
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

    /**
     *
     * Address mapping methods
     *
     */
    mapToBillingAddress(response: GooglePayCardDataResponse): AddressRequestBody {
        const billingAddress = response.paymentMethodData.info.billingAddress;

        if (!billingAddress) {
            throw new InvalidArgumentError('Billing address is missing from Google Pay response.');
        }

        const nameParts = (billingAddress.name || '').split(' ');
        const firstName =
            nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

        return {
            firstName,
            lastName,
            company: '',
            address1: billingAddress.address1 || '',
            address2: [billingAddress.address2, billingAddress.address3].filter(Boolean).join(' '),
            city: billingAddress.locality || billingAddress.administrativeArea || '',
            email: response.email || '',
            stateOrProvince: billingAddress.administrativeArea || '',
            stateOrProvinceCode: billingAddress.administrativeArea || '',
            countryCode: billingAddress.countryCode || '',
            postalCode: billingAddress.postalCode || '',
            phone: billingAddress.phoneNumber || '',
            shouldSaveAddress: false,
        };
    }

    /**
     *
     * Utils methods
     *
     */
    removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.style.display = 'none';
        }
    }

    private buildPaymentDataRequest(transactionInfo: GooglePayTransactionInfo): void {
        const cardPaymentMethod: GooglePayCardPaymentMethod = {
            ...this.getBaseCardPaymentMethod(),
            tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: this.gateway.getPaymentGatewayParameters(),
            },
        };

        this.paymentDataRequest = {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [cardPaymentMethod],
            transactionInfo,
            merchantInfo: this.gateway.getMerchantInfo(),
            emailRequired: true,
        };
    }

    private getBaseCardPaymentMethod(): GooglePayBaseCardPaymentMethod {
        return {
            type: 'CARD',
            parameters: this.gateway.getCardParameters(),
        };
    }

    private getPaymentsClientOrThrow(): GooglePaymentsClient {
        return guard(
            this.paymentsClient,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }

    private getPaymentDataRequestOrThrow(): GooglePayPaymentDataRequest {
        return guard(
            this.paymentDataRequest,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }
}
