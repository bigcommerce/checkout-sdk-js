import { some } from 'lodash';

import { Address } from '../../../address';
import { BillingAddress } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { Customer } from '../../../customer';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodFailedError } from '../../errors';
import isVaultedInstrument from '../../is-vaulted-instrument';
import { HostedInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { StripeAddress, StripeBillingDetails, StripeCardElement, StripeHandleCardPaymentOptions, StripePaymentMethodData, StripeShippingDetails, StripeV3Client } from './stripev3';
import StripeV3ScriptLoader from './stripev3-script-loader';

export default class StripeV3PaymentStrategy implements PaymentStrategy {
    private _stripeV3Client?: StripeV3Client;
    private _cardElement?: StripeCardElement;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _stripeScriptLoader: StripeV3ScriptLoader
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const stripeOptions = options.stripev3;

        if (!stripeOptions) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.stripev3" argument is not provided.');
        }

        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethod(options.methodId);

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._stripeV3Client = await this._stripeScriptLoader.load(
            paymentMethod.initializationData.stripePublishableKey,
            paymentMethod.initializationData.stripeConnectedAccount);
        const elements = this._stripeV3Client.elements();
        const cardElement = elements.create('card', {
            style: stripeOptions.style,
        });
        cardElement.mount(`#${stripeOptions.containerId}`);
        this._cardElement = cardElement;

        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;
        const shouldSaveInstrument = Boolean(paymentData && (paymentData as HostedInstrument).shouldSaveInstrument);

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() => {
                if (paymentData && isVaultedInstrument(paymentData)) {
                    return this._store.dispatch(this._paymentActionCreator.submitPayment({...payment, paymentData}))
                        .catch(error => {
                            if (!(error instanceof RequestError) || !some(error.body.errors, { code: 'three_d_secure_required' })) {
                                return Promise.reject(error);
                            }

                            return this._getStripeJs().handleCardPayment(error.body.three_ds_result.token)
                                .then(stripeResponse => {
                                    if (stripeResponse.error || !stripeResponse.paymentIntent.id) {
                                        throw new PaymentMethodFailedError(stripeResponse.error && stripeResponse.error.message);
                                    }

                                    const paymentPayload = {
                                        methodId: payment.methodId,
                                        paymentData: {
                                            nonce: stripeResponse.paymentIntent.id,
                                        },
                                    };

                                    return this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
                                });
                        });
                }

                return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(payment.methodId))
                    .then(state => {
                        const paymentMethod = state.paymentMethods.getPaymentMethod(payment.methodId);
                        const paymentIntent = paymentMethod && paymentMethod.clientToken;

                        if (!this._cardElement) {
                            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                        }

                        return this._getStripeJs().createPaymentMethod('card', this._cardElement, this._mapStripePaymentMethodOptions())
                            .then(stripePaymentMethod => {
                                if (stripePaymentMethod.error || !stripePaymentMethod.paymentMethod.id) {
                                    throw new PaymentMethodFailedError(stripePaymentMethod.error && stripePaymentMethod.error.message);
                                }

                                if (!paymentIntent) {
                                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                                }

                                const stripeCardPaymentOptions = {
                                    ...this._mapStripeCardPaymentOptions(shouldSaveInstrument),
                                    payment_method: stripePaymentMethod.paymentMethod.id,
                                };

                                return this._getStripeJs().handleCardPayment(paymentIntent, stripeCardPaymentOptions);
                            })
                            .then(stripeResponse => {
                                if (stripeResponse.error || !stripeResponse.paymentIntent.id) {
                                    throw new PaymentMethodFailedError(stripeResponse.error && stripeResponse.error.message);
                                }

                                const paymentPayload = {
                                    methodId: payment.methodId,
                                    paymentData: {
                                        nonce: stripeResponse.paymentIntent.id,
                                        shouldSaveInstrument,
                                    },
                                };

                                return this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
                            });
                    });
            });
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._cardElement) {
            this._cardElement.unmount();
        }

        return Promise.resolve(this._store.getState());
    }

    private _getStripeJs(): StripeV3Client {
        if (!this._stripeV3Client) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._stripeV3Client;
    }

    private _mapStripeBillingAddress(billingAddress: BillingAddress | undefined): StripeAddress | undefined {
        if (!billingAddress) {
            return undefined;
        }

        return {
            city: billingAddress.city,
            country: billingAddress.countryCode,
            line1: billingAddress.address1,
            line2: billingAddress.address2,
            postal_code: billingAddress.postalCode,
            state: billingAddress.stateOrProvinceCode,
        };
    }

    private _mapStripeShippingAddress(shippingAddress: Address | undefined): StripeAddress {
        if (!shippingAddress) {
            return { };
        }

        return {
            city: shippingAddress.city,
            country: shippingAddress.countryCode,
            line1: shippingAddress.address1,
            line2: shippingAddress.address2,
            postal_code: shippingAddress.postalCode,
            state: shippingAddress.stateOrProvinceCode,
        };
    }

    private _mapStripeBillingDetails({ billingAddress, customer }: { billingAddress?: BillingAddress; customer?: Customer } = {}): StripeBillingDetails {
        const stripeBillingDetails = {
            address: this._mapStripeBillingAddress(billingAddress),
        };

        if (customer) {
            return {
                ...stripeBillingDetails,
                email: customer.email,
                name: `${customer.firstName} ${customer.lastName}`,
            };
        }

        if (billingAddress) {
            return {
                ...stripeBillingDetails,
                email: billingAddress.email,
                name: `${billingAddress.firstName} ${billingAddress.lastName}`,
            };
        }

        return {
            name: 'Guest',
        };
    }

    private _mapStripeShippingDetails({ shippingAddress, customer }: { shippingAddress?: Address ; customer?: Customer } = {}): StripeShippingDetails {
        const stripeShippingDetails = {
            address: this._mapStripeShippingAddress(shippingAddress),
        };

        if (customer) {
            return {
                ...stripeShippingDetails,
                name: `${customer.firstName} ${customer.lastName}`,
            };
        }

        if (shippingAddress) {
            return {
                ...stripeShippingDetails,
                name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            };
        }

        return {
            ...stripeShippingDetails,
            name: 'Guest',
        };
    }

    private _getCustomer(): Customer | undefined {
        const customer = this._store.getState().customer.getCustomer();

        if (customer) {
            if (customer.firstName === '' || customer.lastName === '' || customer.email === '') {
                return undefined;
            }
        }

        return customer;
    }

    private _mapStripeCardPaymentOptions(shouldSaveInstrument: boolean): StripeHandleCardPaymentOptions {
        const customer = this._getCustomer();
        const shippingAddress = this._store.getState().shippingAddress.getShippingAddress();

        const shippingDetails = {
            shipping: this._mapStripeShippingDetails({ shippingAddress, customer }),
        };

        if (customer) {
            return {
                ...shippingDetails,
                receipt_email: customer.email,
                save_payment_method: shouldSaveInstrument,
            };
        } else {
            return {
                ...shippingDetails,
            };
        }
    }

    private _mapStripePaymentMethodOptions(): StripePaymentMethodData {
        const customer = this._getCustomer();
        const billingAddress = this._store.getState().billingAddress.getBillingAddress();

        return {
            billing_details: this._mapStripeBillingDetails({ billingAddress, customer }),
        };
    }
}
