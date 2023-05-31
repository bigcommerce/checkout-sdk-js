import { includes } from 'lodash';

import { PaymentMethodInvalidError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { Address } from '../../../address';
import { BillingAddress } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
} from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { PaymentMethodCancelledError } from '../../errors';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import KlarnaPayments, {
    KlarnaAddress,
    KlarnaAuthorizationResponse,
    KlarnaLoadResponse,
    KlarnaUpdateSessionParams,
} from './klarna-payments';
import {
    supportedCountries,
    supportedCountriesRequiringStates,
} from './klarna-supported-countries';
import KlarnaV2ScriptLoader from './klarnav2-script-loader';
import KlarnaV2TokenUpdater from './klarnav2-token-updater';

export default class KlarnaV2PaymentStrategy implements PaymentStrategy {
    private _klarnaPayments?: KlarnaPayments;
    private _unsubscribe?: () => void;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _klarnav2ScriptLoader: KlarnaV2ScriptLoader,
        private _klarnav2TokenUpdater: KlarnaV2TokenUpdater,
    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const key = options.gatewayId ? options.methodId + options.gatewayId : options.methodId;

        return this._klarnav2ScriptLoader
            .load()
            .then((klarnaPayments) => {
                this._klarnaPayments = klarnaPayments;
            })
            .then(() => {
                this._unsubscribe = this._store.subscribe(
                    (state) => {
                        if (state.paymentStrategies.isInitialized(key)) {
                            this._loadPaymentsWidget(options);
                        }
                    },
                    (state) => {
                        const checkout = state.checkout.getCheckout();

                        return checkout && checkout.outstandingBalance;
                    },
                    (state) => {
                        const checkout = state.checkout.getCheckout();

                        return checkout && checkout.coupons;
                    },
                );

                return this._loadPaymentsWidget(options);
            })
            .then(() => this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._unsubscribe) {
            this._unsubscribe();
        }

        return Promise.resolve(this._store.getState());
    }

    execute(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        if (!payload.payment) {
            throw new InvalidArgumentError(
                'Unable to proceed because "payload.payment" argument is not provided.',
            );
        }

        const {
            payment: { paymentData, ...paymentPayload },
        } = payload;
        const { gatewayId } = paymentPayload;

        if (!gatewayId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "payload.payment.gatewayId" argument is not provided.',
            );
        }

        return this._authorize(paymentPayload.methodId)
            .then(({ authorization_token: authorizationToken }) =>
                this._store.dispatch(
                    this._remoteCheckoutActionCreator.initializePayment(gatewayId, {
                        authorizationToken,
                    }),
                ),
            )
            .then(() =>
                this._store.dispatch(
                    this._orderActionCreator.submitOrder(
                        {
                            ...payload,
                            payment: paymentPayload,
                            useStoreCredit: payload.useStoreCredit,
                        },
                        options,
                    ),
                ),
            );
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private async _loadPaymentsWidget(
        options: PaymentInitializeOptions,
    ): Promise<KlarnaLoadResponse> {
        if (!options.klarnav2) {
            throw new InvalidArgumentError(
                'Unable to load widget because "options.klarnav2" argument is not provided.',
            );
        }

        const {
            methodId,
            gatewayId,
            klarnav2: { container, onLoad },
        } = options;

        if (!gatewayId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "payload.payment.gatewayId" argument is not provided.',
            );
        }

        const state = this._store.getState();
        const cartId = state.cart.getCartOrThrow().id;
        const params = { params: cartId };

        await this._klarnav2TokenUpdater.updateClientToken(gatewayId, { params }).catch(() => {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        });

        return new Promise<KlarnaLoadResponse>((resolve) => {
            const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

            if (!this._klarnaPayments || !paymentMethod.clientToken) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            this._klarnaPayments.init({ client_token: paymentMethod.clientToken });
            this._klarnaPayments.load(
                { container, payment_method_category: paymentMethod.id },
                (response) => {
                    if (onLoad) {
                        onLoad(response);
                    }

                    resolve(response);
                },
            );
        });
    }

    private _getUpdateSessionData(
        billingAddress: BillingAddress,
        shippingAddress?: Address,
    ): KlarnaUpdateSessionParams {
        if (
            !includes(
                [...supportedCountries, ...supportedCountriesRequiringStates],
                billingAddress.countryCode,
            )
        ) {
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

    private _needsStateCode(countryCode: string) {
        return includes(supportedCountriesRequiringStates, countryCode);
    }

    private _mapToKlarnaAddress(address: Address, email?: string): KlarnaAddress {
        const klarnaAddress: KlarnaAddress = {
            street_address: address.address1,
            city: address.city,
            country: address.countryCode,
            given_name: address.firstName,
            family_name: address.lastName,
            postal_code: address.postalCode,
            region: this._needsStateCode(address.countryCode)
                ? address.stateOrProvinceCode
                : address.stateOrProvince,
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

    private _authorize(methodId: string): Promise<KlarnaAuthorizationResponse> {
        return new Promise<KlarnaAuthorizationResponse>((resolve, reject) => {
            const billingAddress = this._store.getState().billingAddress.getBillingAddress();
            const shippingAddress = this._store.getState().shippingAddress.getShippingAddress();

            if (!billingAddress) {
                throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
            }

            const updateSessionData = this._getUpdateSessionData(billingAddress, shippingAddress);

            if (!this._klarnaPayments) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            this._klarnaPayments.authorize(
                { payment_method_category: methodId },
                updateSessionData,
                (res) => {
                    if (res.approved) {
                        return resolve(res);
                    }

                    if (res.show_form) {
                        return reject(new PaymentMethodCancelledError());
                    }

                    reject(new PaymentMethodInvalidError());
                },
            );
        });
    }
}
