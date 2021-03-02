import { FormPoster } from '@bigcommerce/form-poster';
import { pick } from 'lodash';

import { Address, LegacyAddress } from '../../../address';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, StandardError } from '../../../common/error/errors';
import { PaymentMethod } from '../../../payment';
import { BraintreeError,
    BraintreePaypalCheckout,
    BraintreeShippingAddressOverride,
    BraintreeSDKCreator,
    BraintreeTokenizePayload,
    PaypalClientInstance,
    RenderButtonsData } from '../../../payment/strategies/braintree';
import { PaypalAuthorizeData, PaypalHostWindow } from '../../../payment/strategies/paypal';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class BraintreePaypalButtonStrategy implements CheckoutButtonStrategy {
    private _paypalCheckout?: BraintreePaypalCheckout;
    private _paymentMethod?: PaymentMethod;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _formPoster: FormPoster,
        private _offerCredit: boolean = false,
        private _window: PaypalHostWindow,
        private _renderButtonsData?: RenderButtonsData
    ) {}

    initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const paypalOptions = (this._offerCredit ? options.braintreepaypalcredit : options.braintreepaypal) || {};
        const state = this._store.getState();
        const paymentMethod = this._paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);

        if (!paymentMethod || !paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._braintreeSDKCreator.initialize(paymentMethod.clientToken);
        const container = `#${options.containerId}`;

        this._renderButtonsData = {
            paymentMethod,
            paypalOptions,
            container,
        };

        return Promise.all([
            this._braintreeSDKCreator.getPaypalCheckout((paypalCheckoutInstance: PaypalClientInstance) => this.renderButtons(paypalCheckoutInstance)),
            this._braintreeSDKCreator.getPaypal(),
        ])
            .then(([paypalCheckout]) => {
                if (!this._paypalCheckout) {
                    this._paypalCheckout = paypalCheckout;
                }
            });
    }

    renderButtons(paypalCheckoutInstance: PaypalClientInstance) {
        const allowedSources = [];
        const disallowedSources = [];
        const { paypalOptions, paymentMethod, container } = this._renderButtonsData as RenderButtonsData;
        const { paypal } = this._window;

        if (paypal) {
            if (paypalOptions.allowCredit) {
                allowedSources.push(paypal.FUNDING.CREDIT);
            } else {
                disallowedSources.push(paypal.FUNDING.CREDIT);
            }
            paypal.Buttons({
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
                createOrder: () => this._setupPayment(paypalOptions.shippingAddress, paypalOptions.onPaymentError, paypalCheckoutInstance),
                onApprove: (data: PaypalAuthorizeData) => this._tokenizePayment(data, paypalCheckoutInstance, paypalOptions.shouldProcessPayment, paypalOptions.onAuthorizeError),
            }).render(container);
        }
    }

    deinitialize(): Promise<void> {
        this._paymentMethod = undefined;
        this._paypalCheckout = undefined;

        this._braintreeSDKCreator.teardown();

        return Promise.resolve();
    }

    private _setupPayment(
        address?: Address | null,
        onError?: (error: BraintreeError | StandardError) => void,
        paypalCheckoutInstance?: any
    ): Promise<string> {
        return this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout())
            .then(state => {
                const checkout = state.checkout.getCheckout();
                const config = state.config.getStoreConfig();
                const customer = state.customer.getCustomer();
                const shippingAddress = address === undefined ?
                    customer && customer.addresses && customer.addresses[0] :
                    address;

                if (!checkout) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                }

                if (!config) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                return paypalCheckoutInstance.createPayment({
                    flow: 'checkout',
                    enableShippingAddress: true,
                    shippingAddressEditable: false,
                    shippingAddressOverride: shippingAddress ? this._mapToBraintreeAddress(shippingAddress) : undefined,
                    amount: checkout?.outstandingBalance,
                    currency: config?.currency.code,
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
        paypalCheckoutInstance: PaypalClientInstance,
        shouldProcessPayment?: boolean,
        onError?: (error: BraintreeError | StandardError) => void
    ): Promise<BraintreeTokenizePayload> {
        if (!this._paymentMethod || !paypalCheckoutInstance) {
            throw new NotInitializedError(NotInitializedErrorType.CheckoutButtonNotInitialized);
        }

        const methodId = this._paymentMethod.id;

        return Promise.all([
            paypalCheckoutInstance.tokenizePayment(data),
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
            phone_number: payload.details.phone,
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
                first_name: payload.details.firstName,
                last_name: payload.details.lastName,
                phone_number: payload.details.phone,
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

    private _mapToBraintreeAddress(address: Address): BraintreeShippingAddressOverride {
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
