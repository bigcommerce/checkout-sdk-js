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
    ShippingAddressUpdateResult,
    ShippingLineItem,
    ShippingOptionData,
    WalletButtonIntegrationService,
} from '@bigcommerce/checkout-sdk/wallet-button-integration';

import formatGooglePayTotalPrice from './format-google-pay-total-price';
import GooglePayWalletGateway from './gateways/google-pay-wallet-gateway';
import getFirstAndLastName from './get-first-and-last-name';
import GooglePayScriptLoader from './google-pay-script-loader';
import isGooglePayCardNetworkKey from './guards/is-google-pay-card-network-key';
import {
    CallbackIntentsType,
    CallbackTriggerType,
    ErrorReasonType,
    GooglePayBaseCardPaymentMethod,
    GooglePayButtonOptions,
    GooglePayCardDataResponse,
    GooglePayCardNetwork,
    GooglePayFullBillingAddress,
    GooglePayGatewayBaseRequest,
    GooglePayInitializationData,
    GooglePaymentsClient,
    GooglePayMerchantInfo,
    GooglePayPaymentDataChangedResponse,
    GooglePayPaymentDataRequest,
    GooglePayPaymentOptions,
    GooglePayTransactionInfo,
    GoogleShippingOption,
    IntermediatePaymentData,
    NewTransactionInfo,
    onPaymentDataChangedOut,
    TotalPriceStatusType,
} from './types';

interface GooglePayWalletShippingContext {
    cartId: string;
    lineItems?: ShippingLineItem[];
    currencyDecimalPlaces: number;
}

export default class GooglePayWalletService {
    private baseRequest: GooglePayGatewayBaseRequest = { apiVersion: 2, apiVersionMinor: 0 };
    private paymentsClient?: GooglePaymentsClient;
    private baseCardPaymentMethod?: GooglePayBaseCardPaymentMethod;
    private paymentDataRequest?: GooglePayPaymentDataRequest;
    private paymentButton?: HTMLElement;
    private shippingContext?: GooglePayWalletShippingContext;
    private transactionInfo?: GooglePayTransactionInfo;
    private shippingUpdateResult?: ShippingAddressUpdateResult;

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
        supportedShippingCountriesCodes?: string[],
        shippingContext?: GooglePayWalletShippingContext,
    ): Promise<void> {
        this.shippingUpdateResult = undefined;
        this.shippingContext = shippingContext;
        this.transactionInfo = transactionInfo;

        const paymentDataCallbacks = this.isShippingRequired()
            ? this.getPaymentDataCallbacks()
            : undefined;

        this.paymentsClient = await this.scriptLoader.getGooglePaymentsClient(
            !!paymentMethod.config.testMode,
            paymentDataCallbacks,
        );

        await this.gateway.initialize(paymentMethod, transactionInfo.currencyCode);

        this.buildPaymentRequests(paymentMethod, transactionInfo, supportedShippingCountriesCodes);
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

    async updateShippingAddress(
        cartId: string,
        address: AddressRequestBody,
        lineItems?: ShippingLineItem[],
        consignmentEntityId?: string,
    ): Promise<ShippingAddressUpdateResult | undefined> {
        const previousSelection = this.shippingUpdateResult?.selectedShippingOptionEntityId;
        const updateResult = await this.walletButtonIntegrationService.updateShippingAddress(
            cartId,
            address,
            lineItems === undefined && consignmentEntityId === undefined
                ? undefined
                : {
                      lineItems,
                      consignmentEntityId:
                          consignmentEntityId ?? this.shippingUpdateResult?.consignmentEntityId,
                  },
        );

        if (!updateResult) {
            return;
        }

        const selectedShippingOption = this.getPreferredShippingOption(
            updateResult.availableShippingOptions,
            previousSelection,
            updateResult.selectedShippingOptionEntityId,
        );

        if (!selectedShippingOption) {
            this.shippingUpdateResult = updateResult;

            return updateResult;
        }

        this.shippingUpdateResult =
            updateResult.selectedShippingOptionEntityId === selectedShippingOption.entityId
                ? updateResult
                : await this.selectShippingOption(
                      cartId,
                      updateResult.consignmentEntityId,
                      selectedShippingOption.entityId,
                  );

        return this.shippingUpdateResult;
    }

    async selectShippingOption(
        cartId: string,
        consignmentEntityId: string,
        shippingOptionEntityId: string,
    ): Promise<ShippingAddressUpdateResult> {
        return this.walletButtonIntegrationService.selectShippingOption(
            cartId,
            consignmentEntityId,
            shippingOptionEntityId,
        );
    }

    mapToShippingAddress(response: GooglePayCardDataResponse): AddressRequestBody | undefined {
        const { shippingAddress } = response;

        if (!shippingAddress) {
            return;
        }

        return this.mapToAddressRequestBody(shippingAddress, response.email);
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

        return this.mapToAddressRequestBody(billingAddress, response.email);
    }

    private mapToAddressRequestBody(
        address: GooglePayFullBillingAddress,
        email?: string,
    ): AddressRequestBody {
        const [firstName, lastName] = getFirstAndLastName(address.name);

        return {
            firstName,
            lastName,
            company: '',
            address1: address.address1 || '',
            address2: [address.address2, address.address3].filter(Boolean).join(' '),
            city: address.locality || address.administrativeArea || '',
            email: email || '',
            stateOrProvince: address.administrativeArea || '',
            stateOrProvinceCode: address.administrativeArea || '',
            countryCode: address.countryCode || '',
            postalCode: address.postalCode || '',
            phone: address.phoneNumber || '',
            shouldSaveAddress: false,
        };
    }

    private getPaymentDataCallbacks(): GooglePayPaymentOptions {
        return {
            paymentDataCallbacks: {
                onPaymentDataChanged: (data) => this.handlePaymentDataChanged(data),
            },
        };
    }

    private async handlePaymentDataChanged(data: IntermediatePaymentData): onPaymentDataChangedOut {
        const { callbackTrigger, shippingAddress, shippingOptionData } = data;

        if (callbackTrigger === CallbackTriggerType.INITIALIZE && !shippingAddress) {
            return;
        }

        const shippingContext = this.shippingContext;

        if (!shippingContext?.cartId || !shippingContext.lineItems?.length) {
            return this.getShippingCallbackError(
                this.getShippingErrorReason(callbackTrigger),
                callbackTrigger,
                'Shipping options are unavailable for this cart.',
            );
        }

        try {
            if (callbackTrigger === CallbackTriggerType.SHIPPING_OPTION) {
                return await this.handleShippingOptionCallback(shippingContext, shippingOptionData);
            }

            if (
                callbackTrigger === CallbackTriggerType.INITIALIZE ||
                callbackTrigger === CallbackTriggerType.SHIPPING_ADDRESS
            ) {
                return await this.handleShippingAddressCallback(
                    shippingContext,
                    callbackTrigger,
                    shippingAddress,
                );
            }
        } catch (error) {
            return this.getShippingCallbackError(
                this.getShippingErrorReason(callbackTrigger),
                callbackTrigger,
                error instanceof Error ? error.message : 'Unable to update shipping information.',
            );
        }
    }

    private async handleShippingAddressCallback(
        shippingContext: GooglePayWalletShippingContext,
        callbackTrigger: CallbackTriggerType,
        shippingAddress?: GooglePayFullBillingAddress,
    ): Promise<GooglePayPaymentDataChangedResponse> {
        if (!shippingAddress) {
            return this.getShippingCallbackError(
                ErrorReasonType.SHIPPING_ADDRESS_INVALID,
                callbackTrigger,
                'A shipping address is required.',
            );
        }

        const previousSelection = this.shippingUpdateResult?.selectedShippingOptionEntityId;
        const updateResult = await this.updateShippingAddress(
            shippingContext.cartId,
            this.mapToAddressRequestBody(shippingAddress),
            shippingContext.lineItems,
            this.shippingUpdateResult?.consignmentEntityId,
        );

        if (!updateResult) {
            return this.getShippingCallbackError(
                ErrorReasonType.SHIPPING_ADDRESS_UNSERVICEABLE,
                callbackTrigger,
                'Unable to update shipping information for this address.',
            );
        }

        if (!updateResult.availableShippingOptions.length) {
            if (callbackTrigger === CallbackTriggerType.INITIALIZE) {
                return {
                    newTransactionInfo: this.getNewTransactionInfo(
                        updateResult.currencyCode,
                        this.formatShippingTotalPrice(updateResult.totalPrice),
                        TotalPriceStatusType.ESTIMATED,
                    ),
                };
            }

            return this.getShippingCallbackError(
                ErrorReasonType.SHIPPING_ADDRESS_UNSERVICEABLE,
                callbackTrigger,
                'No shipping options are available for this address.',
            );
        }

        const defaultShippingOption = this.getPreferredShippingOption(
            updateResult.availableShippingOptions,
            previousSelection,
            updateResult.selectedShippingOptionEntityId,
        );

        if (!defaultShippingOption) {
            return this.getShippingCallbackError(
                ErrorReasonType.SHIPPING_ADDRESS_UNSERVICEABLE,
                callbackTrigger,
                'No shipping options are available for this address.',
            );
        }

        return this.getShippingAddressCallbackResponse(
            updateResult,
            updateResult.availableShippingOptions,
            defaultShippingOption.entityId,
        );
    }

    private async handleShippingOptionCallback(
        shippingContext: GooglePayWalletShippingContext,
        shippingOptionData: IntermediatePaymentData['shippingOptionData'],
    ): Promise<GooglePayPaymentDataChangedResponse> {
        const currentUpdate = this.shippingUpdateResult;

        if (!currentUpdate || !shippingOptionData?.id) {
            return this.getShippingCallbackError(
                ErrorReasonType.SHIPPING_OPTION_INVALID,
                CallbackTriggerType.SHIPPING_OPTION,
                'The selected shipping option is unavailable.',
            );
        }

        this.shippingUpdateResult = await this.selectShippingOption(
            shippingContext.cartId,
            currentUpdate.consignmentEntityId,
            shippingOptionData.id,
        );

        return {
            newTransactionInfo: this.getNewTransactionInfo(
                this.shippingUpdateResult.currencyCode,
                this.formatShippingTotalPrice(this.shippingUpdateResult.totalPrice),
                TotalPriceStatusType.FINAL,
            ),
        };
    }

    private getShippingAddressCallbackResponse(
        result: ShippingAddressUpdateResult,
        availableShippingOptions: ShippingAddressUpdateResult['availableShippingOptions'],
        defaultSelectedOptionId: string,
    ): GooglePayPaymentDataChangedResponse {
        return {
            newTransactionInfo: this.getNewTransactionInfo(
                result.currencyCode,
                this.formatShippingTotalPrice(result.totalPrice),
                TotalPriceStatusType.FINAL,
            ),
            newShippingOptionParameters: {
                defaultSelectedOptionId,
                shippingOptions: availableShippingOptions.map((option) =>
                    this.mapToGooglePayShippingOption(option),
                ),
            },
        };
    }

    private getNewTransactionInfo(
        currencyCode: string,
        totalPrice: string,
        totalPriceStatus: TotalPriceStatusType,
    ): NewTransactionInfo['newTransactionInfo'] {
        return {
            ...(this.transactionInfo?.countryCode && {
                countryCode: this.transactionInfo.countryCode,
            }),
            currencyCode,
            totalPrice,
            totalPriceStatus,
        };
    }

    private formatShippingTotalPrice(totalPrice: string): string {
        return formatGooglePayTotalPrice(
            Number(totalPrice),
            this.shippingContext?.currencyDecimalPlaces ?? 2,
        );
    }

    private getPreferredShippingOption(
        shippingOptions: ShippingOptionData[],
        previousSelection?: string,
        selectedShippingOptionEntityId?: string,
    ): ShippingOptionData | undefined {
        let previousOption: ShippingOptionData | undefined;
        let selectedOption: ShippingOptionData | undefined;
        let recommendedOption: ShippingOptionData | undefined;

        shippingOptions.forEach((shippingOption) => {
            if (!previousOption && shippingOption.entityId === previousSelection) {
                previousOption = shippingOption;
            }

            if (!selectedOption && shippingOption.entityId === selectedShippingOptionEntityId) {
                selectedOption = shippingOption;
            }

            if (shippingOption.isRecommended && !recommendedOption) {
                recommendedOption = shippingOption;
            }
        });

        return previousOption || selectedOption || recommendedOption || shippingOptions[0];
    }

    private mapToGooglePayShippingOption(
        option: ShippingAddressUpdateResult['availableShippingOptions'][number],
    ): GoogleShippingOption {
        const cost = option.cost.formattedV2 || option.cost.value;

        return {
            id: option.entityId,
            label: `${cost} ${option.description}`,
            ...(option.transitTime && { description: option.transitTime }),
        };
    }

    private getShippingCallbackError(
        reason: ErrorReasonType,
        intent: CallbackTriggerType,
        message: string,
    ): GooglePayPaymentDataChangedResponse {
        const errorIntent =
            intent === CallbackTriggerType.INITIALIZE
                ? CallbackTriggerType.SHIPPING_ADDRESS
                : intent;

        return {
            newTransactionInfo: {
                ...(this.transactionInfo?.countryCode && {
                    countryCode: this.transactionInfo.countryCode,
                }),
                currencyCode: this.transactionInfo?.currencyCode || 'USD',
                totalPrice: this.transactionInfo?.totalPrice || '0',
                totalPriceStatus:
                    this.transactionInfo?.totalPriceStatus || TotalPriceStatusType.ESTIMATED,
            },
            error: { reason, intent: errorIntent, message },
        };
    }

    private getShippingErrorReason(callbackTrigger: CallbackTriggerType): ErrorReasonType {
        return callbackTrigger === CallbackTriggerType.SHIPPING_OPTION
            ? ErrorReasonType.SHIPPING_OPTION_INVALID
            : ErrorReasonType.SHIPPING_ADDRESS_UNSERVICEABLE;
    }

    private buildPaymentRequests(
        paymentMethod: PaymentMethod<GooglePayInitializationData>,
        transactionInfo: GooglePayTransactionInfo,
        supportedShippingCountriesCodes?: string[],
    ): void {
        const shippingData = this.isShippingRequired()
            ? {
                  shippingAddressRequired: true,
                  shippingOptionRequired: true,
                  callbackIntents: [
                      CallbackIntentsType.SHIPPING_ADDRESS,
                      CallbackIntentsType.SHIPPING_OPTION,
                  ],
                  shippingAddressParameters: {
                      ...(supportedShippingCountriesCodes?.length && {
                          allowedCountryCodes: supportedShippingCountriesCodes,
                      }),
                      phoneNumberRequired: true,
                  },
              }
            : {};

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
            ...shippingData,
        };
    }

    private isShippingRequired(): boolean {
        return Boolean(
            this.shippingContext?.lineItems?.some((lineItem) => lineItem.isShippingRequired),
        );
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
