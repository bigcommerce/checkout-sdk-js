import { RequestSender, Response } from '@bigcommerce/request-sender';

import { AddressRequestBody } from '../../../address';
import { BillingAddressActionCreator, BillingAddressUpdateRequestBody } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
} from '../../../common/error/errors';
import { RemoteCheckoutSynchronizationError } from '../../../remote-checkout/errors';
import { ConsignmentActionCreator } from '../../../shipping';
import { PaymentMethodInvalidError } from '../../errors';
import PaymentMethodActionCreator from '../../payment-method-action-creator';

import {
    ButtonColor,
    ButtonType,
    EnvironmentType,
    GooglePaymentData,
    GooglePayAddress,
    GooglePayClient,
    GooglePayInitializer,
    GooglePayPaymentDataRequestV2,
    GooglePaySDK,
    TokenizePayload
} from './googlepay';
import GooglePayScriptLoader from './googlepay-script-loader';

export default class GooglePayPaymentProcessor {
    private _googlePayClient?: GooglePayClient;
    private _methodId?: string;
    private _paymentDataRequest?: GooglePayPaymentDataRequestV2;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _googlePayScriptLoader: GooglePayScriptLoader,
        private _googlePayInitializer: GooglePayInitializer,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _consigmentActionCreator: ConsignmentActionCreator,
        private _requestSender: RequestSender
    ) {}

    initialize(methodId: string): Promise<void> {
        this._methodId = methodId;

        return this._configureWallet();
    }

    deinitialize(): Promise<void> {
        return this._googlePayInitializer.teardown();
    }

    createButton(
        onClick: (event: Event) => Promise<void>,
        buttonType: ButtonType = ButtonType.Short,
        buttonColor: ButtonColor = ButtonColor.Default
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

    displayWallet(): Promise<GooglePaymentData> {
        if (!this._googlePayClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._googlePayClient.loadPaymentData(this._getPaymentDataRequest());
    }

    handleSuccess(paymentData: GooglePaymentData): Promise<InternalCheckoutSelectors> {
        return this._postForm(this._googlePayInitializer.parseResponse(paymentData))
            .then(() => this._updateBillingAddress(paymentData));
    }

    updateShippingAddress(shippingAddress: GooglePayAddress): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._consigmentActionCreator.updateAddress(this._mapGooglePayAddressToShippingAddress(shippingAddress))
        );
    }

    private _configureWallet(): Promise<void> {
        const methodId = this._getMethodId();

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

                const { testMode } = paymentMethod.config;

                return Promise.all([
                    this._googlePayScriptLoader.load(),
                    this._googlePayInitializer.initialize(checkout, paymentMethod, hasShippingAddress),
                ]).then(([googlePay, paymentDataRequest]) => {
                    this._googlePayClient = this._getGooglePayClient(googlePay, testMode);
                    this._paymentDataRequest = paymentDataRequest;

                    return this._googlePayClient.isReadyToPay({
                        allowedPaymentMethods: [
                            {
                                type: paymentDataRequest.allowedPaymentMethods[0].type,
                                parameters: {
                                    allowedAuthMethods: paymentDataRequest.allowedPaymentMethods[0].parameters.allowedAuthMethods,
                                    allowedCardNetworks: paymentDataRequest.allowedPaymentMethods[0].parameters.allowedCardNetworks,
                                },
                            },
                        ],
                        apiVersion: paymentDataRequest.apiVersion,
                        apiVersionMinor: paymentDataRequest.apiVersionMinor,
                    }).then(response => {
                        if (response.result) {
                            return;
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

    private _getPaymentDataRequest(): GooglePayPaymentDataRequestV2 {
        if (!this._paymentDataRequest) {
            throw new RemoteCheckoutSynchronizationError();
        }

        return this._paymentDataRequest;
    }

    private _getGooglePayClient(google: GooglePaySDK, testMode?: boolean): GooglePayClient {
        if (testMode === undefined) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const environment: EnvironmentType = testMode ? 'TEST' : 'PRODUCTION';

        return new google.payments.api.PaymentsClient({ environment });
    }

    private _getMethodId(): string {
        if (!this._methodId) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._methodId;
    }

    private _mapGooglePayAddressToBillingAddress(paymentData: GooglePaymentData, id: string): BillingAddressUpdateRequestBody {
        return {
            id,
            firstName: paymentData.paymentMethodData.info.billingAddress.name.split(' ').slice(0, -1).join(' '),
            lastName: paymentData.paymentMethodData.info.billingAddress.name.split(' ').slice(-1).join(' '),
            company: paymentData.paymentMethodData.info.billingAddress.companyName,
            address1: paymentData.paymentMethodData.info.billingAddress.address1,
            address2: paymentData.paymentMethodData.info.billingAddress.address2 + paymentData.paymentMethodData.info.billingAddress.address3,
            city: paymentData.paymentMethodData.info.billingAddress.locality,
            stateOrProvince: paymentData.paymentMethodData.info.billingAddress.administrativeArea,
            stateOrProvinceCode: paymentData.paymentMethodData.info.billingAddress.administrativeArea,
            postalCode: paymentData.paymentMethodData.info.billingAddress.postalCode,
            countryCode: paymentData.paymentMethodData.info.billingAddress.countryCode,
            phone: paymentData.paymentMethodData.info.billingAddress.phoneNumber,
            customFields: [],
            email: paymentData.email,
        };
    }

    private _mapGooglePayAddressToShippingAddress(address: GooglePayAddress): AddressRequestBody {
        return {
            firstName: address.name.split(' ').slice(0, -1).join(' '),
            lastName: address.name.split(' ').slice(-1).join(' '),
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

        return this._requestSender.post('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: {
                payment_type: postPaymentData.type,
                nonce: postPaymentData.nonce,
                provider: this._getMethodId(),
                action: 'set_external_checkout',
                card_information: this._getCardInformation(cardInformation),
            },
        });
    }

    private _updateBillingAddress(paymentData: GooglePaymentData): Promise<InternalCheckoutSelectors> {
        const remoteBillingAddress = this._store.getState().billingAddress.getBillingAddress();

        if (!remoteBillingAddress) {
            throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
        }

        const googlePayAddressMapped = this._mapGooglePayAddressToBillingAddress(paymentData, remoteBillingAddress.id);

        return this._store.dispatch(
            this._billingAddressActionCreator.updateAddress(googlePayAddressMapped)
        );
    }
}
