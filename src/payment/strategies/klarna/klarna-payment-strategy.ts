import { includes } from 'lodash';

import { Address } from '../../../address';
import BillingAddress from '../../../billing/billing-address';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType
} from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { PaymentMethodCancelledError } from '../../errors';
import PaymentMethodInvalidError from '../../errors/payment-method-invalid-error';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import KlarnaCredit, { KlarnaAddress, KlarnaLoadResponse, KlarnaUpdateSessionParams } from './klarna-credit';
import KlarnaScriptLoader from './klarna-script-loader';

export default class KlarnaPaymentStrategy implements PaymentStrategy {
    private _klarnaCredit?: KlarnaCredit;
    private _unsubscribe?: (() => void);
    private _supportedEUCountries = ['AT', 'DE', 'DK', 'FI', 'GB', 'NL', 'NO', 'SE', 'CH'];

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _klarnaScriptLoader: KlarnaScriptLoader
    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        return this._klarnaScriptLoader.load()
            .then(klarnaCredit => { this._klarnaCredit = klarnaCredit; })
            .then(() => {
                this._unsubscribe = this._store.subscribe(
                    state => {
                        if (state.paymentStrategies.isInitialized(options.methodId)) {
                            this._loadWidget(options);
                        }
                    },
                    state => {
                        const checkout = state.checkout.getCheckout();

                        return checkout && checkout.grandTotal;
                    }
                );

                return this._loadWidget(options);
            })
            .then(() => this._store.getState());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (this._unsubscribe) {
            this._unsubscribe();
        }

        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (!payload.payment) {
            throw new InvalidArgumentError('Unable to proceed because "payload.payment" argument is not provided.');
        }

        const { payment: { paymentData, ...paymentPayload } } = payload;

        return this._authorize()
            .then(({ authorization_token: authorizationToken }) => this._store.dispatch(
                this._remoteCheckoutActionCreator.initializePayment(paymentPayload.methodId, { authorizationToken })
            ))
            .then(() => this._store.dispatch(
                this._orderActionCreator.submitOrder({
                    ...payload,
                    payment: paymentPayload,
                    // Note: API currently doesn't support using Store Credit with Klarna.
                    // To prevent deducting customer's store credit, set it as false.
                    useStoreCredit: false,
                }, options)
            ));
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private _loadWidget(options: PaymentInitializeOptions): Promise<KlarnaLoadResponse> {
        if (!options.klarna) {
            throw new InvalidArgumentError('Unable to load widget because "options.klarna" argument is not provided.');
        }

        const { methodId, klarna: { container, onLoad } } = options;

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => new Promise<KlarnaLoadResponse>((resolve, reject) => {
                const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
                const billingAddress = state.billingAddress.getBillingAddress();
                const shippingAddress = state.shippingAddress.getShippingAddress();

                if (!paymentMethod) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                if (!billingAddress) {
                    throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
                }

                if (!this._klarnaCredit || !paymentMethod.clientToken) {
                    throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                }

                const updateSessionData = this._getUpdateSessionData(billingAddress, shippingAddress);

                this._klarnaCredit.init({ client_token: paymentMethod.clientToken });

                this._klarnaCredit.load({ container }, updateSessionData, response => {
                    if (onLoad) {
                        onLoad(response);
                    }

                    if (!response.show_form) {
                        reject(new PaymentMethodInvalidError());
                    } else {
                        resolve(response);
                    }
                });
            }));
    }

    private _getUpdateSessionData(billingAddress: BillingAddress, shippingAddress?: Address): KlarnaUpdateSessionParams {
        if (!includes(this._supportedEUCountries, billingAddress.countryCode)) {
            return {};
        }

        const data: KlarnaUpdateSessionParams = {
            billing_address: this._mapToKlarnaAddress(billingAddress, billingAddress.email),
        };

        if (shippingAddress) {
            data.shipping_address = this._mapToKlarnaAddress(shippingAddress, billingAddress.email);
        }

        return data;
    }

    private _mapToKlarnaAddress(address: Address, email?: string): KlarnaAddress {
        const klarnaAddress: KlarnaAddress = {
            street_address: address.address1,
            city: address.city,
            country: address.countryCode,
            given_name: address.firstName,
            family_name: address.lastName,
            postal_code: address.postalCode,
            region: address.stateOrProvince,
            email,
        };

        if (address.address2) {
            klarnaAddress.street_address2 = address.address2;
        }

        if (address.phone) {
            klarnaAddress.phone = address.phone;
        }

        return klarnaAddress;
    }

    private _authorize(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this._klarnaCredit) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            this._klarnaCredit.authorize({}, res => {
                if (res.approved) {
                    return resolve(res);
                }

                if (res.show_form) {
                    return reject(new PaymentMethodCancelledError());
                }

                reject(new PaymentMethodInvalidError());
            });
        });
    }
}
