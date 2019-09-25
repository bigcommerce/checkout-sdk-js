import { FormPoster } from '@bigcommerce/form-poster';
import { pick } from 'lodash';

import { Address, LegacyAddress } from '../../../address';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, StandardError } from '../../../common/error/errors';
import { PaymentMethod } from '../../../payment';
import { BraintreeAddress, BraintreeError, BraintreePaypalCheckout, BraintreeSDKCreator, BraintreeTokenizePayload } from '../../../payment/strategies/braintree';
import { PaypalAuthorizeData, PaypalScriptLoader } from '../../../payment/strategies/paypal';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class BraintreePaypalButtonStrategy implements CheckoutButtonStrategy {
    private _paypalCheckout?: BraintreePaypalCheckout;
    private _paymentMethod?: PaymentMethod;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _paypalScriptLoader: PaypalScriptLoader,
        private _formPoster: FormPoster,
        private _offerCredit: boolean = false
    ) {}

    initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const paypalOptions = (this._offerCredit ? options.braintreepaypalcredit : options.braintreepaypal) || {};
        const state = this._store.getState();
        const paymentMethod = this._paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);

        if (!paymentMethod || !paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._braintreeSDKCreator.initialize(paymentMethod.clientToken);

        return Promise.all([
            this._braintreeSDKCreator.getPaypalCheckout(),
            this._paypalScriptLoader.loadPaypal(),
        ])
            .then(([paypalCheckout, paypal]) => {
                this._paypalCheckout = paypalCheckout;

                const allowedSources = [];
                const disallowedSources = [];

                if (paypalOptions.allowCredit) {
                    allowedSources.push(paypal.FUNDING.CREDIT);
                } else {
                    disallowedSources.push(paypal.FUNDING.CREDIT);
                }

                return paypal.Button.render({
                    env: paymentMethod.config.testMode ? 'sandbox' : 'production',
                    commit: paypalOptions.shouldProcessPayment ? true : false,
                    funding: {
                        allowed: allowedSources,
                        disallowed: disallowedSources,
                    },
                    style: {
                        shape: 'rect',
                        label: this._offerCredit ? 'credit' : undefined,
                        ...pick(paypalOptions.style, 'layout', 'size', 'color', 'label', 'shape', 'tagline', 'fundingicons'),
                    },
                    payment: () => this._setupPayment(paypalOptions.shippingAddress, paypalOptions.onPaymentError),
                    onAuthorize: data => this._tokenizePayment(data, paypalOptions.shouldProcessPayment, paypalOptions.onAuthorizeError),
                }, options.containerId);
            });
    }

    deinitialize(): Promise<void> {
        this._paypalCheckout = undefined;
        this._paymentMethod = undefined;

        this._braintreeSDKCreator.teardown();

        return Promise.resolve();
    }

    private _setupPayment(
        address?: Address | null,
        onError?: (error: BraintreeError | StandardError) => void
    ): Promise<string> {
        return this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout())
            .then(state => {
                const checkout = state.checkout.getCheckout();
                const config = state.config.getStoreConfig();
                const customer = state.customer.getCustomer();
                const shippingAddress = address === undefined ?
                    customer && customer.addresses && customer.addresses[0] :
                    address;

                if (!this._paypalCheckout) {
                    throw new NotInitializedError(NotInitializedErrorType.CheckoutButtonNotInitialized);
                }

                if (!checkout) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                }

                if (!config) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                return this._paypalCheckout.createPayment({
                    flow: 'checkout',
                    enableShippingAddress: true,
                    shippingAddressEditable: false,
                    shippingAddressOverride: shippingAddress ? this._mapToBraintreeAddress(shippingAddress) : undefined,
                    amount: checkout.outstandingBalance,
                    currency: config.currency.code,
                    offerCredit: this._offerCredit,
                });
            })
            .catch(error => {
                if (onError) {
                    onError(error);
                }

                throw error;
            });
    }

    private _tokenizePayment(
        data: PaypalAuthorizeData,
        shouldProcessPayment?: boolean,
        onError?: (error: BraintreeError | StandardError) => void
    ): Promise<BraintreeTokenizePayload> {
        if (!this._paypalCheckout || !this._paymentMethod) {
            throw new NotInitializedError(NotInitializedErrorType.CheckoutButtonNotInitialized);
        }

        const methodId = this._paymentMethod.id;

        return Promise.all([
            this._paypalCheckout.tokenizePayment(data),
            this._braintreeSDKCreator.getDataCollector({ paypal: true }),
        ])
            .then(([payload, { deviceData }]) => {
                this._formPoster.postForm('/checkout.php', {
                    payment_type: 'paypal',
                    provider: methodId,
                    action: shouldProcessPayment ? 'process_payment' : 'set_external_checkout',
                    nonce: payload.nonce,
                    device_data: deviceData,
                    shipping_address: JSON.stringify(this._mapToLegacyShippingAddress(payload)),
                    billing_address: JSON.stringify(this._mapToLegacyBillingAddress(payload)),
                });

                return payload;
            })
            .catch(error => {
                if (onError) {
                    onError(error);
                }

                throw error;
            });
    }

    private _mapToLegacyShippingAddress(payload: BraintreeTokenizePayload): Partial<LegacyAddress> {
        const shippingAddress = payload.details.shippingAddress;
        const recipientName = shippingAddress && shippingAddress.recipientName || '';
        const [firstName, lastName] = recipientName.split(' ');

        return {
            email: payload.details.email,
            first_name: firstName,
            last_name: lastName,
            phone_number: shippingAddress && shippingAddress.phone || payload.details.phone,
            address_line_1: shippingAddress && shippingAddress.line1,
            address_line_2: shippingAddress && shippingAddress.line2,
            city: shippingAddress && shippingAddress.city,
            state: shippingAddress && shippingAddress.state,
            country_code: shippingAddress && shippingAddress.countryCode,
            postal_code: shippingAddress && shippingAddress.postalCode,
        };
    }

    private _mapToLegacyBillingAddress(payload: BraintreeTokenizePayload): Partial<LegacyAddress> {
        const billingAddress = payload.details.billingAddress;
        const shippingAddress = payload.details.shippingAddress;

        if (billingAddress) {
            return {
                email: payload.details.email,
                first_name: billingAddress.firstName || payload.details.firstName,
                last_name: billingAddress.lastName || payload.details.lastName,
                phone_number: billingAddress.phone || payload.details.phone,
                address_line_1: billingAddress.line1,
                address_line_2: billingAddress.line2,
                city: billingAddress.city,
                state: billingAddress.state,
                country_code: billingAddress.countryCode,
                postal_code: billingAddress.postalCode,
            };
        }

        return {
            email: payload.details.email,
            first_name: payload.details.firstName,
            last_name: payload.details.lastName,
            phone_number: payload.details.phone,
            address_line_1: shippingAddress && shippingAddress.line1,
            address_line_2: shippingAddress && shippingAddress.line2,
            city: shippingAddress && shippingAddress.city,
            state: shippingAddress && shippingAddress.state,
            country_code: shippingAddress && shippingAddress.countryCode,
            postal_code: shippingAddress && shippingAddress.postalCode,
        };
    }

    private _mapToBraintreeAddress(address: Address): BraintreeAddress {
        return {
            line1: address.address1,
            line2: address.address2,
            city: address.city,
            state: address.stateOrProvinceCode,
            postalCode: address.postalCode,
            countryCode: address.countryCode,
            phone: address.phone,
            recipientName: `${address.firstName} ${address.lastName}`,
        };
    }
}
