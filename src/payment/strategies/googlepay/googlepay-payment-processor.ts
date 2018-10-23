import { RequestSender, Response } from '@bigcommerce/request-sender';

import { PaymentMethodActionCreator } from '../..';
import { BillingAddressActionCreator, BillingAddressUpdateRequestBody } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
} from '../../../common/error/errors';
import { toFormUrlEncoded } from '../../../common/http-request/';

import {
    ButtonColor,
    ButtonType,
    EnvironmentType,
    GooglePaymentData,
    GooglePayAddress,
    GooglePayClient,
    GooglePayInitializer,
    GooglePayPaymentDataRequestV1,
    GooglePaySDK,
    TokenizePayload
} from './googlepay';
import GooglePayScriptLoader from './googlepay-script-loader';

export default class GooglePayPaymentProcessor {
    private _googlePaymentsClient?: GooglePayClient;
    private _methodId?: string;
    private _googlePaymentDataRequest?: GooglePayPaymentDataRequestV1;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _googlePayScriptLoader: GooglePayScriptLoader,
        private _googlePayInitializer: GooglePayInitializer,
        private _requestSender: RequestSender,
        private _billingAddressActionCreator: BillingAddressActionCreator
    ) { }

    initialize(methodId: string): Promise<void> {
        this._methodId = methodId;

        return this._configureWallet();
    }

    deinitialize(): Promise<void> {
        return this._googlePayInitializer.teardown();
    }

    createButton(
        onClick: () => {},
        buttonType: ButtonType = ButtonType.Short,
        buttonColor: ButtonColor = ButtonColor.Default
    ): HTMLElement {
        if (!this._googlePaymentsClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._googlePaymentsClient.createButton({
            buttonColor: ButtonColor.Default,
            buttonType: ButtonType.Short,
            onClick,
        });
    }

    displayWallet(): Promise<GooglePaymentData> {
        if (!this._googlePaymentsClient || !this._googlePaymentDataRequest || !this._googlePaymentDataRequest) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const googlePaymentsClient = this._googlePaymentsClient;
        const googlePaymentDataRequest = this._googlePaymentDataRequest;

        return this._googlePaymentsClient.isReadyToPay({
            allowedPaymentMethods: this._googlePaymentDataRequest.allowedPaymentMethods,
        }).then(response => {
            if (response.result) {
                return googlePaymentsClient.loadPaymentData(googlePaymentDataRequest);
            } else {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }
        });
    }

    handleSuccess(paymentData: GooglePaymentData): Promise<InternalCheckoutSelectors> {
        return this._googlePayInitializer.parseResponse(paymentData)
            .then(tokenizedPayload => this._postForm(tokenizedPayload))
            .then(() => this.updateBillingAddress(paymentData.cardInfo.billingAddress));
    }

    private updateBillingAddress(billingAddress: GooglePayAddress): Promise<InternalCheckoutSelectors> {
        if (!this._methodId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const remoteBillingAddress = this._store.getState().billingAddress.getBillingAddress();

        if (!remoteBillingAddress) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const googlePayAddressMapped = this._mapGooglePayAddressToBillingAddress(billingAddress, remoteBillingAddress.id);

        return this._store.dispatch(
            this._billingAddressActionCreator.updateAddress(googlePayAddressMapped)
        );
    }

    private _getCardInformation(cardInformation: { cardType: string, lastFour: string }) {
        return {
            type: cardInformation.cardType,
            number: cardInformation.lastFour,
        };
    }

    private _postForm(postPaymentData: TokenizePayload): Promise<Response<any>> {
        const cardInformation = postPaymentData.details;

        return this._requestSender.post('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: toFormUrlEncoded({
                payment_type: postPaymentData.type,
                nonce: postPaymentData.nonce,
                provider: this._methodId,
                action: 'set_external_checkout',
                card_information: this._getCardInformation(cardInformation),
            }),
        });
    }

    private _configureWallet(): Promise<void> {
        if (!this._methodId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const methodId = this._methodId;

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => {
                const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
                const checkout = state.checkout.getCheckout();
                const hasShippingAddress = !!state.shippingAddress.getShippingAddress();

                if (!paymentMethod) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                if (!checkout) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                }

                const testMode = paymentMethod.config.testMode;

                return Promise.all([
                    this._googlePayScriptLoader.load(),
                    this._googlePayInitializer.initialize(checkout, paymentMethod, hasShippingAddress),
                ])
                    .then(([googlePay, googlePayPaymentDataRequest]) => {
                        this._googlePaymentsClient = this._getGooglePayClient(googlePay, testMode);
                        this._googlePaymentDataRequest = googlePayPaymentDataRequest;
                    })
                    .catch((error: Error) => {
                        throw error;
                    });
            });
    }

    private _getGooglePayClient(google: GooglePaySDK, testMode?: boolean): GooglePayClient {
        if (testMode === undefined) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const environment: EnvironmentType = testMode ? 'TEST' : 'PRODUCTION';

        return new google.payments.api.PaymentsClient({ environment });
    }

    private _mapGooglePayAddressToBillingAddress(address: GooglePayAddress, id: string): BillingAddressUpdateRequestBody {
        return {
            id,
            firstName: address.name.split(' ').slice(0, -1).join(' '),
            lastName: address.name.split(' ').slice(-1).join(' '),
            company: address.companyName,
            address1: address.address1,
            address2: address.address2 + address.address3 + address.address4 + address.address5,
            city: address.locality,
            stateOrProvince: address.administrativeArea,
            stateOrProvinceCode: address.administrativeArea,
            postalCode: address.postalCode,
            countryCode: address.countryCode,
            phone: address.phoneNumber,
            customFields: [],
        };
    }
}
