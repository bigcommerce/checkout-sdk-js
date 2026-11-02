import { FormPoster } from '@bigcommerce/form-poster';

import {
    guard,
    InvalidArgumentError,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentMethod,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    AddressRequestBody,
    CheckoutHandoff,
    CheckoutHandoffMethod,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import GooglePayWalletGateway from './gateways/google-pay-wallet-gateway';
import getFirstAndLastName from './get-first-and-last-name';
import GooglePayScriptLoader from './google-pay-script-loader';
import isGooglePayCardNetworkKey from './guards/is-google-pay-card-network-key';
import {
    GooglePayBaseCardPaymentMethod,
    GooglePayButtonOptions,
    GooglePayCardDataResponse,
    GooglePayCardNetwork,
    GooglePayGatewayBaseRequest,
    GooglePayInitializationData,
    GooglePaymentsClient,
    GooglePayMerchantInfo,
    GooglePayPaymentDataRequest,
    GooglePayTransactionInfo,
} from './types';

export default class GooglePayWalletService {
    private baseRequest: GooglePayGatewayBaseRequest = { apiVersion: 2, apiVersionMinor: 0 };
    private paymentsClient?: GooglePaymentsClient;
    private baseCardPaymentMethod?: GooglePayBaseCardPaymentMethod;
    private paymentDataRequest?: GooglePayPaymentDataRequest;
    private paymentButton?: HTMLElement;

    constructor(
        private walletButtonIntegrationService: WalletButtonIntegrationService,
        private scriptLoader: GooglePayScriptLoader,
        private gateway: GooglePayWalletGateway,
        private formPoster: FormPoster,
    ) {}

    /**
     *
     * Google Pay SDK methods
     *
     */
    async initialize(
        paymentMethod: PaymentMethod<GooglePayInitializationData>,
        transactionInfo: GooglePayTransactionInfo,
    ): Promise<void> {
        this.paymentsClient = await this.scriptLoader.getGooglePaymentsClient(
            !!paymentMethod.config.testMode,
        );

        await this.gateway.initialize(paymentMethod, transactionInfo.currencyCode);

        this.buildPaymentRequests(paymentMethod, transactionInfo);
    }

    async isReadyToPay(): Promise<boolean> {
        try {
            const { result } = await this.getPaymentsClientOrThrow().isReadyToPay({
                ...this.baseRequest,
                allowedPaymentMethods: [this.getBaseCardPaymentMethodOrThrow()],
            });

            return result;
        } catch {
            return false;
        }
    }

    renderButton(
        containerId: string,
        options: Omit<GooglePayButtonOptions, 'allowedPaymentMethods'>,
    ): void {
        const container = document.getElementById(containerId);

        if (!container) {
            throw new InvalidArgumentError(
                `Unable to render the Google Pay button because no element with id "${containerId}" was found.`,
            );
        }

        this.paymentButton?.remove();

        this.paymentButton = container.appendChild(
            this.getPaymentsClientOrThrow().createButton({
                ...options,
                allowedPaymentMethods: [this.getBaseCardPaymentMethodOrThrow()],
            }),
        );
    }

    async showPaymentSheet(): Promise<GooglePayCardDataResponse> {
        return this.getPaymentsClientOrThrow().loadPaymentData(this.getPaymentDataRequestOrThrow());
    }

    async deinitialize(): Promise<void> {
        this.paymentButton?.remove();
        this.paymentButton = undefined;

        await this.gateway.deinitialize();
    }

    /**
     *
     * Payment tokenizing and redirect methods
     *
     */
    async addBillingAddress(cartId: string, response: GooglePayCardDataResponse): Promise<void> {
        await this.walletButtonIntegrationService.addBillingAddress(
            cartId,
            this.mapToBillingAddress(response),
        );
    }

    async redirectToCheckout(cartId: string, response: GooglePayCardDataResponse): Promise<void> {
        const { paymentWalletData, queryParams } = await this.gateway.getRedirectData(
            response,
            cartId,
        );

        const redirectResponse =
            await this.walletButtonIntegrationService.getRedirectToCheckoutHandoff({
                paymentWalletData,
                cartEntityId: cartId,
                queryParams: [{ key: 'action', value: 'set_external_checkout' }, ...queryParams],
            });

        const { redirectUrls } = redirectResponse.body;

        if (!redirectUrls) {
            throw new PaymentMethodFailedError('Failed to redirect to checkout page');
        }

        if (!redirectUrls.externalCheckoutHandoff) {
            throw new PaymentMethodFailedError(
                'Failed to redirect to checkout page: checkout handoff is missing in the redirect response',
            );
        }

        this.handOffToCheckout(redirectUrls.externalCheckoutHandoff);
    }

    /**
     *
     * Utils methods
     *
     */

    /**
     * Follows the transport the mutation asked for. The method comes from GraphQL and is not checked
     * at runtime, so an unknown value fails instead of silently turning a POST into a navigation.
     */
    private handOffToCheckout(handoff: CheckoutHandoff): void {
        switch (handoff.method) {
            case CheckoutHandoffMethod.Post:
                this.formPoster.postForm(
                    handoff.url,
                    handoff.fields.reduce<Record<string, string>>(
                        (acc, { name, value }) => ({ ...acc, [name]: value }),
                        {},
                    ),
                );

                return;

            case CheckoutHandoffMethod.Redirect:
                window.location.assign(handoff.url);

                return;

            default:
                throw new PaymentMethodFailedError(
                    `Unsupported checkout handoff method: ${String(handoff.method)}`,
                );
        }
    }

    private mapToBillingAddress(response: GooglePayCardDataResponse): AddressRequestBody {
        const { billingAddress } = response.paymentMethodData.info;

        if (!billingAddress) {
            throw new InvalidArgumentError('Billing address is missing from Google Pay response.');
        }

        const [firstName, lastName] = getFirstAndLastName(billingAddress.name);

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

    private buildPaymentRequests(
        paymentMethod: PaymentMethod<GooglePayInitializationData>,
        transactionInfo: GooglePayTransactionInfo,
    ): void {
        const allowedCardNetworks = paymentMethod.supportedCards
            .filter(isGooglePayCardNetworkKey)
            .map((key) => GooglePayCardNetwork[key]);

        const baseCardPaymentMethod: GooglePayBaseCardPaymentMethod = {
            type: 'CARD',
            parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks,
                billingAddressRequired: true,
                billingAddressParameters: {
                    format: 'FULL',
                    phoneNumberRequired: true,
                },
            },
        };

        const merchantInfo = this.getMerchantInfo(paymentMethod);

        this.baseCardPaymentMethod = baseCardPaymentMethod;
        this.paymentDataRequest = {
            ...this.baseRequest,
            allowedPaymentMethods: [
                {
                    ...baseCardPaymentMethod,
                    tokenizationSpecification: {
                        type: 'PAYMENT_GATEWAY',
                        parameters: this.gateway.getPaymentGatewayParameters(
                            merchantInfo,
                            transactionInfo,
                        ),
                    },
                },
            ],
            transactionInfo,
            merchantInfo,
            emailRequired: true,
        };
    }

    private getMerchantInfo(
        paymentMethod: PaymentMethod<GooglePayInitializationData>,
    ): GooglePayMerchantInfo {
        const initializationData = guard(
            paymentMethod.initializationData,
            () => new InvalidArgumentError('Missing initialization data.'),
        );

        const {
            googleMerchantName: merchantName,
            googleMerchantId: merchantId,
            platformToken: authJwt,
        } = initializationData;

        return { merchantName, merchantId, authJwt };
    }

    private getPaymentsClientOrThrow(): GooglePaymentsClient {
        return this.getOrThrow(this.paymentsClient);
    }

    private getBaseCardPaymentMethodOrThrow(): GooglePayBaseCardPaymentMethod {
        return this.getOrThrow(this.baseCardPaymentMethod);
    }

    private getPaymentDataRequestOrThrow(): GooglePayPaymentDataRequest {
        return this.getOrThrow(this.paymentDataRequest);
    }

    private getOrThrow<T>(value?: T): T {
        return guard(
            value,
            () => new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
        );
    }
}
