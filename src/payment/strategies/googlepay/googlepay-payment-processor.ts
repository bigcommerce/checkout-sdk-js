import { PaymentMethod, PaymentMethodActionCreator } from '../..';
import { BillingAddressActionCreator, BillingAddressUpdateRequestBody } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    StandardError,
} from '../../../common/error/errors';
import { RemoteCheckoutSynchronizationError } from '../../../remote-checkout/errors';
import { ShippingStrategyActionCreator } from '../../../shipping';

import {
    ButtonColor, ButtonType,
    EnvironmentType, GooglePaymentsError, GooglePaymentData, GooglePayAddress, GooglePayClient, GooglePayInitializer,
    GooglePayPaymentDataRequestV1,
    GooglePaySDK, TokenizePayload
} from './googlepay';
import GooglePayScriptLoader from './googlepay-script-loader';

export default class GooglePayPaymentProcessor {
    private _googlePaymentsClient!: GooglePayClient;
    private _methodId!: string;
    private _paymentMethod?: PaymentMethod;
    private _walletButton?: HTMLElement;
    private _googlePaymentDataRequest!: GooglePayPaymentDataRequestV1;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _googlePayScriptLoader: GooglePayScriptLoader,
        private _googlePayInitializer: GooglePayInitializer,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _shippingStrategyActionCreator: ShippingStrategyActionCreator
    ) { }

    initialize(methodId: string): Promise<void> {
        this._methodId = methodId;

        return this._configureWallet();
    }

    deinitialize(): Promise<void> {
        return this._googlePayInitializer.teardown();
    }

    createButton(callback: () => {}): HTMLElement {
        return this._googlePaymentsClient.createButton({
            buttonColor: ButtonColor.Default,
            buttonType: ButtonType.Short,
            onClick: callback,
        });
    }

    updateBillingAddress(billingAddress: GooglePayAddress): Promise<InternalCheckoutSelectors> {
        if (!this._methodId) {
            throw new RemoteCheckoutSynchronizationError();
        }

        const remoteBillingAddress = this._store.getState().billingAddress.getBillingAddress();

        if (!remoteBillingAddress) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const googlePayAddressMapped: BillingAddressUpdateRequestBody = this._mapGooglePayAddressToBillingAddress(billingAddress, remoteBillingAddress.id);

        return this._store.dispatch(
            this._billingAddressActionCreator.updateAddress(googlePayAddressMapped)
        );
    }

    displayWallet(): Promise<GooglePaymentData> {
        if (!this._paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!this._googlePaymentsClient && !this._googlePaymentDataRequest) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._googlePaymentsClient.isReadyToPay({
            allowedPaymentMethods: this._googlePaymentDataRequest.allowedPaymentMethods,
        }).then( response => {
            if (response) {
                return this._googlePaymentsClient.loadPaymentData(this._googlePaymentDataRequest)
                    .then(paymentData => paymentData)
                    .catch((err: GooglePaymentsError) => {
                        throw new Error(err.statusCode);
                    });
            } else {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }
        });
    }

    parseResponse(paymentData: any): Promise<TokenizePayload> {
        return this._googlePayInitializer.parseResponse(paymentData);
    }

    private _configureWallet(): Promise<void> {
        if (!this._methodId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(this._methodId))
            .then(state => {
                const paymentMethod = state.paymentMethods.getPaymentMethod(this._methodId);
                const storeConfig = state.config.getStoreConfig();
                const checkout = state.checkout.getCheckout();
                const hasShippingAddress = !!state.shippingAddress.getShippingAddress();

                if (!paymentMethod) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                if (!storeConfig) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                if (!checkout) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                }

                this._paymentMethod = paymentMethod;
                const testMode = paymentMethod.config.testMode;

                return Promise.all([
                    this._googlePayScriptLoader.load(),
                    this._googlePayInitializer.initialize(checkout, paymentMethod, hasShippingAddress),
                ])
                    .then(([googlePay, googlePayPaymentDataRequest]) => {
                        this._googlePaymentsClient = this._getGooglePaymentsClient(googlePay, testMode);
                        this._googlePaymentDataRequest = googlePayPaymentDataRequest;
                    })
                    .catch((error: Error) => {
                        throw new StandardError(error.message);
                    });
            });
    }

    private _getGooglePaymentsClient(google: GooglePaySDK, testMode?: boolean): GooglePayClient {
        testMode = true; // TODO: remove when push this code to final review
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
