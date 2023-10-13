import { FormPoster } from '@bigcommerce/form-poster';
import { RequestSender } from '@bigcommerce/request-sender';

import {
    AddressRequestBody,
    BillingAddressRequestBody,
    guard,
    InvalidArgumentError,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentMethod,
    PaymentMethodFailedError,
    SDK_VERSION_HEADERS,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayGateway from './gateways/google-pay-gateway';
import GooglePayScriptLoader from './google-pay-script-loader';
import isGooglePayAdditionalActionProcessable from './guards/is-google-pay-additional-action-processable';
import {
    CallbackIntentsType,
    GooglePayBaseCardPaymentMethod,
    GooglePayButtonOptions,
    GooglePayCardDataResponse,
    GooglePayCardPaymentMethod,
    GooglePayGatewayBaseRequest,
    GooglePayInitializationData,
    GooglePayIsReadyToPayRequest,
    GooglePaymentsClient,
    GooglePayPaymentDataRequest,
    GooglePayPaymentOptions,
    GooglePayTransactionInfo,
} from './types';

export default class GooglePayPaymentProcessor {
    private _paymentsClient?: GooglePaymentsClient;
    private _baseRequest: GooglePayGatewayBaseRequest = { apiVersion: 2, apiVersionMinor: 0 };
    private _baseCardPaymentMethod?: GooglePayBaseCardPaymentMethod;
    private _cardPaymentMethod?: GooglePayCardPaymentMethod;
    private _paymentDataRequest?: GooglePayPaymentDataRequest;
    private _isReadyToPayRequest?: GooglePayIsReadyToPayRequest;
    private _isBuyNowFlow = false;

    constructor(
        private _scriptLoader: GooglePayScriptLoader,
        private _gateway: GooglePayGateway,
        private _requestSender: RequestSender,
        private _formPoster: FormPoster,
    ) {}

    async initialize(
        getPaymentMethod: () => PaymentMethod<GooglePayInitializationData>,
        googlePayPaymentOptions?: GooglePayPaymentOptions,
        isBuyNowFlow?: boolean,
    ): Promise<void> {
        this._paymentsClient = await this._scriptLoader.getGooglePaymentsClient(
            getPaymentMethod().config.testMode,
            googlePayPaymentOptions,
        );

        this._isBuyNowFlow = Boolean(isBuyNowFlow);

        await this._gateway.initialize(getPaymentMethod, this._isBuyNowFlow);

        await this._buildPayloads();

        await this._determineReadinessToPay();

        this._prefetchGooglePaymentData();
    }

    getNonce(methodId: string) {
        return this._gateway.getNonce(methodId);
    }

    addPaymentButton(
        containerId: string,
        options: Omit<GooglePayButtonOptions, 'allowedPaymentMethods'>,
    ): HTMLElement {
        const container = document.querySelector<HTMLElement>(`#${containerId}`);

        if (!container) {
            throw new InvalidArgumentError(
                'Unable to render the Google Pay button to an invalid HTML container element.',
            );
        }

        const paymentButton = this._getPaymentsClient().createButton({
            ...options,
            allowedPaymentMethods: [this._getBaseCardPaymentMethod()],
        });

        return container.appendChild(paymentButton);
    }

    updatePaymentDataRequest({
        transactionInfo,
        callbackIntents,
    }: {
        transactionInfo: GooglePayTransactionInfo;
        callbackIntents?: CallbackIntentsType[];
    }) {
        if (this._paymentDataRequest) {
            this._paymentDataRequest.transactionInfo = transactionInfo;
            this._paymentDataRequest.callbackIntents = callbackIntents;
        }
    }

    async showPaymentSheet(): Promise<GooglePayCardDataResponse> {
        const paymentDataRequest = this._getPaymentDataRequest();

        if (!this._isBuyNowFlow) {
            paymentDataRequest.transactionInfo = this._gateway.getTransactionInfo();
        }

        return this._getPaymentsClient().loadPaymentData(paymentDataRequest);
    }

    async setExternalCheckoutXhr(
        provider: string,
        response: GooglePayCardDataResponse,
    ): Promise<void> {
        return this._setExternalCheckout(provider, response);
    }

    async setExternalCheckoutForm(
        provider: string,
        response: GooglePayCardDataResponse,
        siteLink?: string,
    ): Promise<void> {
        return this._setExternalCheckout(provider, response, true, siteLink);
    }

    mapToBillingAddressRequestBody(
        response: GooglePayCardDataResponse,
    ): BillingAddressRequestBody | undefined {
        return this._gateway.mapToBillingAddressRequestBody(response);
    }

    mapToShippingAddressRequestBody(
        response: GooglePayCardDataResponse,
    ): AddressRequestBody | undefined {
        return this._gateway.mapToShippingAddressRequestBody(response);
    }

    processAdditionalAction(error: unknown): Promise<void> {
        return isGooglePayAdditionalActionProcessable(this._gateway)
            ? this._gateway.processAdditionalAction(error)
            : Promise.reject(error);
    }

    async signOut(providerId: string): Promise<void> {
        await this._requestSender.get(`/remote-checkout/${providerId}/signout`);
    }

    async _setExternalCheckout(
        provider: string,
        response: GooglePayCardDataResponse,
        useFormPoster = false,
        siteLink?: string,
    ): Promise<void> {
        const url = '/checkout.php';
        const body = {
            action: 'set_external_checkout',
            provider,
            ...(await this._gateway.mapToExternalCheckoutData(response)),
        };

        if (useFormPoster) {
            return new Promise((resolve) => {
                this._formPoster.postForm(
                    siteLink ? `${siteLink}/checkout` : url,
                    {
                        ...body,
                        card_information: JSON.stringify(body.card_information),
                    },
                    resolve,
                );
            });
        }

        await this._requestSender.post(url, {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
                ...SDK_VERSION_HEADERS,
            },
            body,
        });
    }

    private _prefetchGooglePaymentData(): void {
        const paymentDataRequest = this._getPaymentDataRequest();

        paymentDataRequest.transactionInfo = this._gateway.getTransactionInfo();

        this._getPaymentsClient().prefetchPaymentData(paymentDataRequest);
    }

    private async _determineReadinessToPay(): Promise<void> {
        try {
            const { result } = await this._getPaymentsClient().isReadyToPay(
                this._getIsReadyToPayRequest(),
            );

            if (result === false) {
                throw new PaymentMethodFailedError(
                    'Google Pay is not supported by the current device and browser, please try another payment method.',
                );
            }
        } catch (error) {
            if (error instanceof PaymentMethodFailedError) {
                throw error;
            }

            throw new PaymentMethodFailedError();
        }
    }

    private async _buildPayloads(): Promise<void> {
        this._baseCardPaymentMethod = {
            type: 'CARD',
            parameters: this._gateway.getCardParameters(),
        };
        this._cardPaymentMethod = {
            ...this._baseCardPaymentMethod,
            tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: this._gateway.getPaymentGatewayParameters(),
            },
        };
        this._paymentDataRequest = {
            ...this._baseRequest,
            allowedPaymentMethods: [this._cardPaymentMethod],
            transactionInfo: this._gateway.getTransactionInfo(),
            merchantInfo: this._gateway.getMerchantInfo(),
            ...(await this._gateway.getRequiredData()),
        };
        this._isReadyToPayRequest = {
            ...this._baseRequest,
            allowedPaymentMethods: [this._baseCardPaymentMethod],
        };
    }

    private _getBaseCardPaymentMethod(): GooglePayBaseCardPaymentMethod {
        return this._getOrThrow(this._baseCardPaymentMethod);
    }

    private _getPaymentDataRequest(): GooglePayPaymentDataRequest {
        return this._getOrThrow(this._paymentDataRequest);
    }

    private _getIsReadyToPayRequest(): GooglePayIsReadyToPayRequest {
        return this._getOrThrow(this._isReadyToPayRequest);
    }

    private _getPaymentsClient(): GooglePaymentsClient {
        return this._getOrThrow(this._paymentsClient);
    }

    private _getOrThrow<T>(value?: T): T {
        return guard(
            value,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }
}
