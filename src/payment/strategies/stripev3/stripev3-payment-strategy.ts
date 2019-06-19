import { Address } from '../../../address';
import { BillingAddress } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError, NotInitializedErrorType,
    StandardError
} from '../../../common/error/errors';
import { Customer } from '../../../customer';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import {
    StripeAddress,
    StripeBillingDetails,
    StripeCardElement,
    StripeHandleCardPaymentOptions,
    StripeShippingDetails,
    StripeV3Client
} from './stripev3';
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

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const stripeOptions = options.stripev3;

        if (!stripeOptions) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.stripev3" argument is not provided.');
        }

        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethod(options.methodId);

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._stripeScriptLoader.load(paymentMethod.initializationData.stripePublishableKey)
            .then(stripeJs => {
                this._stripeV3Client = stripeJs;
                const elements = this._stripeV3Client.elements();
                const cardElement = elements.create('card', {
                    style: stripeOptions.style,
                });

                cardElement.mount(`#${stripeOptions.containerId}`);

                this._cardElement = cardElement;

                return Promise.resolve(this._store.getState());
            });
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(payment.methodId))
            .then(state => {
                const paymentMethod = state.paymentMethods.getPaymentMethod(payment.methodId);

                if (!paymentMethod || !paymentMethod.clientToken) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                if (!this._cardElement) {
                    throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                }

                return this._getStripeJs().handleCardPayment(
                    paymentMethod.clientToken, this._cardElement, this._mapStripeCardPaymentOptions()
                ).then(stripeResponse => {
                    if (stripeResponse.error || !stripeResponse.paymentIntent.id) {
                        throw new StandardError(stripeResponse.error && stripeResponse.error.message);
                    }

                    const paymentPayload = {
                        methodId: payment.methodId,
                        paymentData: { nonce: stripeResponse.paymentIntent.id },
                    };

                    return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
                        .then(() =>
                            this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload))
                        );
                });
            });
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
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
            state: billingAddress.postalCode,
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
            state: shippingAddress.postalCode,
        };
    }

    private _mapStripeBillingDetails({ billingAddress, customer }: { billingAddress?: BillingAddress; customer?: Customer; } = {}): StripeBillingDetails {
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

    private _mapStripeShippingDetails({ shippingAddress, customer }: { shippingAddress?: Address ; customer?: Customer; } = {}): StripeShippingDetails {
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

    private _mapStripeCardPaymentOptions(): StripeHandleCardPaymentOptions {
        const customer = this._getCustomer();
        const billingAddress = this._store.getState().billingAddress.getBillingAddress();
        const shippingAddress = this._store.getState().shippingAddress.getShippingAddress();

        const paymentMethodData = {
            payment_method_data: {
                billing_details: this._mapStripeBillingDetails({ billingAddress, customer }),
            },
        };

        const shippingDetails = {
            shipping: this._mapStripeShippingDetails({ shippingAddress, customer }),
        };

        if (billingAddress) {
            if (customer) {
                return {
                    ...paymentMethodData,
                    ...shippingDetails,
                    receipt_email: customer.email,
                };
            } else {
                return {
                    ...paymentMethodData,
                    ...shippingDetails,
                    receipt_email: billingAddress.email,
                };
            }
        }

        if (customer) {
            return {
                ...shippingDetails,
                receipt_email: customer.email,
            };
        } else {
            return {
                ...shippingDetails,
            };
        }
    }
}
