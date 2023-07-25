import { RequestSender, Response } from '@bigcommerce/request-sender';

import { PaymentMethodInvalidError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { AddressRequestBody } from '../../../address';
import { BillingAddressActionCreator, BillingAddressUpdateRequestBody } from '../../../billing';
import { Checkout, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
} from '../../../common/error/errors';
import { SDK_VERSION_HEADERS } from '../../../common/http-request';
import { RemoteCheckoutSynchronizationError } from '../../../remote-checkout/errors';
import { ConsignmentActionCreator } from '../../../shipping';
import PaymentMethodActionCreator from '../../payment-method-action-creator';

import {
    ButtonColor,
    ButtonType,
    EnvironmentType,
    GooglePayAddress,
    GooglePayClient,
    GooglePayInitializer,
    GooglePaymentData,
    GooglePayPaymentDataRequestV2,
    GooglePayPaymentOptions,
    GooglePaySDK,
    TokenizePayload,
    UpdatePaymentDataRequestPayload,
} from './googlepay';
import { getFirstAndLastName } from './googlepay-get-first-and-last-name';
import GooglePayScriptLoader from './googlepay-script-loader';

export default class GooglePayPaymentProcessor {
    private _googlePayClient?: GooglePayClient;
    private _methodId?: string;
    private _paymentDataRequest?: GooglePayPaymentDataRequestV2;
    private _isBuyNowFlow = false;
    private _shouldThrowError = true;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _googlePayScriptLoader: GooglePayScriptLoader,
        private _googlePayInitializer: GooglePayInitializer,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _requestSender: RequestSender,
    ) {}

    initialize(
        methodId: string,
        googlePayClientOptions?: GooglePayPaymentOptions,
    ): Promise<boolean> {
        this._methodId = methodId;

        return this._configureWallet(googlePayClientOptions);
    }

    deinitialize(): Promise<void> {
        return this._googlePayInitializer.teardown();
    }

    createButton(
        onClick: (event: Event) => Promise<void>,
        buttonType: ButtonType = ButtonType.Short,
        buttonColor: ButtonColor = ButtonColor.Default,
    ): HTMLElement {
        if (!this._googlePayClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._googlePayClient.createButton({
            buttonColor,
            buttonType,
            onClick,
        });
    }

    updatePaymentDataRequest(paymentDataRequest: UpdatePaymentDataRequestPayload) {
        const existingPaymentDataRequest = this._getPaymentDataRequest();

        this._paymentDataRequest = {
            ...existingPaymentDataRequest,
            ...paymentDataRequest,
            merchantInfo: {
                ...(existingPaymentDataRequest.merchantInfo ?? {}),
                ...(paymentDataRequest.merchantInfo ?? {}),
            },
            transactionInfo: {
                ...(existingPaymentDataRequest.transactionInfo ?? {}),
                ...(paymentDataRequest.transactionInfo ?? {}),
            },
            shippingAddressParameters: {
                ...(existingPaymentDataRequest.shippingAddressParameters ?? {}),
                ...(paymentDataRequest.shippingAddressParameters ?? {}),
            },
        };
    }

    displayWallet(): Promise<GooglePaymentData> {
        if (!this._googlePayClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._googlePayClient.loadPaymentData(this._getPaymentDataRequest());
    }

    handleSuccess(paymentData: GooglePaymentData): Promise<InternalCheckoutSelectors> {
        return this._googlePayInitializer
            .parseResponse(paymentData)
            .then((tokenizePayload) => this._postForm(tokenizePayload))
            .then(() => this._updateBillingAddress(paymentData));
    }

    updateShippingAddress(shippingAddress: GooglePayAddress): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._consignmentActionCreator.updateAddress(
                this._mapGooglePayAddressToShippingAddress(shippingAddress),
            ),
        );
    }

    updateBuyNowFlowFlag(isBuyNowFlow: boolean): void {
        this._isBuyNowFlow = isBuyNowFlow;
    }

    updateShouldThrowInvalidError(shouldThrowPaymentInvalidError: boolean) {
        this._shouldThrowError = shouldThrowPaymentInvalidError;
    }

    private _configureWallet(
        googlePayClientOptions?: Partial<GooglePayPaymentOptions>,
    ): Promise<boolean> {
        const features = this._store.getState().config.getStoreConfig()?.checkoutSettings.features;
        const options =
            features && features['INT-5826.google_hostname_alias']
                ? { params: { origin: window.location.hostname } }
                : undefined;
        const methodId = this._getMethodId();

        return this._store
            .dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId, options))
            .then((state) => {
                const checkout = this._getCheckout(state);
                const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
                const hasShippingAddress = !!state.shippingAddress.getShippingAddress();

                if (!paymentMethod) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                const { testMode } = paymentMethod.config;

                return Promise.all([
                    this._googlePayScriptLoader.load(),
                    this._googlePayInitializer.initialize(
                        checkout,
                        paymentMethod,
                        hasShippingAddress,
                    ),
                ]).then(([googlePay, paymentDataRequest]) => {
                    this._googlePayClient = this._getGooglePayClient(
                        googlePay,
                        testMode,
                        googlePayClientOptions,
                    );
                    this._paymentDataRequest = paymentDataRequest;

                    return this._googlePayClient
                        .isReadyToPay({
                            allowedPaymentMethods: [
                                {
                                    type: paymentDataRequest.allowedPaymentMethods[0].type,
                                    parameters: {
                                        allowedAuthMethods:
                                            paymentDataRequest.allowedPaymentMethods[0].parameters
                                                .allowedAuthMethods,
                                        allowedCardNetworks:
                                            paymentDataRequest.allowedPaymentMethods[0].parameters
                                                .allowedCardNetworks,
                                    },
                                },
                            ],
                            apiVersion: paymentDataRequest.apiVersion,
                            apiVersionMinor: paymentDataRequest.apiVersionMinor,
                        })
                        .then(({ result: isReadyToPay }) => {
                            if (isReadyToPay) {
                                return isReadyToPay;
                            }

                            if (!this._shouldThrowError) {
                                return isReadyToPay;
                            }

                            throw new PaymentMethodInvalidError();
                        });
                });
            });
    }

    private _getCardInformation(cardInformation: { cardType: string; lastFour: string }) {
        return {
            type: cardInformation.cardType,
            number: cardInformation.lastFour,
        };
    }

    private _getCheckout(state: InternalCheckoutSelectors): Checkout | void {
        if (this._isBuyNowFlow) {
            return;
        }

        const checkout = state.checkout.getCheckout();

        if (!checkout) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        return checkout;
    }

    private _getPaymentDataRequest(): GooglePayPaymentDataRequestV2 {
        if (!this._paymentDataRequest) {
            throw new RemoteCheckoutSynchronizationError();
        }

        return this._paymentDataRequest;
    }

    private _getGooglePayClient(
        google: GooglePaySDK,
        testMode?: boolean,
        googlePayClientOptions?: Partial<GooglePayPaymentOptions>,
    ): GooglePayClient {
        if (testMode === undefined) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const environment: EnvironmentType = testMode ? 'TEST' : 'PRODUCTION';

        return new google.payments.api.PaymentsClient({
            environment,
            ...(googlePayClientOptions ?? {}),
        });
    }

    private _getMethodId(): string {
        if (!this._methodId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._methodId;
    }

    private _mapGooglePayAddressToBillingAddress(
        paymentData: GooglePaymentData,
        id: string,
        customerEmail?: string,
    ): BillingAddressUpdateRequestBody {
        const fullName = paymentData.paymentMethodData.info.billingAddress.name;
        const [firstName, lastName] = getFirstAndLastName(fullName);
        const address1 = paymentData.paymentMethodData.info.billingAddress.address1;
        const city = paymentData.paymentMethodData.info.billingAddress.locality;
        const postalCode = paymentData.paymentMethodData.info.billingAddress.postalCode;
        const countryCode = paymentData.paymentMethodData.info.billingAddress.countryCode;

        if (!firstName || !address1 || !city || !postalCode || !countryCode) {
            throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
        }

        return {
            id,
            firstName,
            lastName,
            company: paymentData.paymentMethodData.info.billingAddress.companyName,
            address1,
            address2:
                paymentData.paymentMethodData.info.billingAddress.address2 +
                paymentData.paymentMethodData.info.billingAddress.address3,
            city,
            stateOrProvince: paymentData.paymentMethodData.info.billingAddress.administrativeArea,
            stateOrProvinceCode:
                paymentData.paymentMethodData.info.billingAddress.administrativeArea,
            postalCode,
            countryCode,
            phone: paymentData.paymentMethodData.info.billingAddress.phoneNumber,
            customFields: [],
            email: customerEmail || paymentData.email,
        };
    }

    private _mapGooglePayAddressToShippingAddress(address: GooglePayAddress): AddressRequestBody {
        const [firstName, lastName] = getFirstAndLastName(address.name);

        return {
            firstName,
            lastName,
            company: address.companyName,
            address1: address.address1,
            address2: address.address2 + address.address3,
            city: address.locality,
            stateOrProvince: address.administrativeArea,
            stateOrProvinceCode: address.administrativeArea,
            postalCode: address.postalCode,
            countryCode: address.countryCode,
            phone: address.phoneNumber,
            customFields: [],
        };
    }

    private _postForm(postPaymentData: TokenizePayload): Promise<Response<void>> {
        const cardInformation = postPaymentData.details;
        const buyNowCartId = this._isBuyNowFlow
            ? this._store.getState().cart.getCartOrThrow().id
            : undefined;

        return this._requestSender.post('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
                ...SDK_VERSION_HEADERS,
            },
            body: {
                payment_type: postPaymentData.type,
                nonce: postPaymentData.nonce,
                tokenFormat: postPaymentData.tokenFormat,
                provider: this._getMethodId(),
                action: 'set_external_checkout',
                card_information: this._getCardInformation(cardInformation),
                ...(buyNowCartId && { cart_id: buyNowCartId }),
            },
        });
    }

    private _updateBillingAddress(
        paymentData: GooglePaymentData,
    ): Promise<InternalCheckoutSelectors> {
        const remoteBillingAddress = this._store.getState().billingAddress.getBillingAddress();

        if (!remoteBillingAddress) {
            throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
        }

        const googlePayAddressMapped = this._mapGooglePayAddressToBillingAddress(
            paymentData,
            remoteBillingAddress.id,
            remoteBillingAddress.email,
        );

        return this._store.dispatch(
            this._billingAddressActionCreator.updateAddress(googlePayAddressMapped),
        );
    }
}
