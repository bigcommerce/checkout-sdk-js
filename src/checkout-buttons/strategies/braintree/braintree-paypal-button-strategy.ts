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
import { PaypalAuthorizeData, PaypalButtonStyleOptions, PaypalHostWindow } from '../../../payment/strategies/paypal';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import { BraintreePaypalButtonInitializeOptions } from './braintree-paypal-button-options';

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

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const paypalOptions = (this._offerCredit ? options.braintreepaypalcredit : options.braintreepaypal) || {};
        const state = this._store.getState();
        const paymentMethod = this._paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);
        const storeState = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        const currency = storeState.config.getStoreConfig()?.shopperCurrency;

        if (!paymentMethod || !paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._braintreeSDKCreator.initialize(paymentMethod.clientToken);
        const container = `#${options.containerId}`;
        const messagingContainerId = options.braintreepaypal?.messagingContainerId;

        this._renderButtonsData = {
            paymentMethod,
            paypalOptions,
            container,
            messagingContainerId,
        };

        return Promise.all([
            this._braintreeSDKCreator.getPaypalCheckout({currency: currency?.code}, (paypalCheckoutInstance: PaypalClientInstance) => this.renderButtons(paypalCheckoutInstance)),
            this._braintreeSDKCreator.getPaypal(),
        ])
            .then(([paypalCheckout]) => {
                if (!this._paypalCheckout) {
                    this._paypalCheckout = paypalCheckout;
                }
            });
    }

    renderButtons(paypalCheckoutInstance: PaypalClientInstance) {
        const { paypalOptions, paymentMethod, container, messagingContainerId } = this._renderButtonsData as RenderButtonsData;
        const { paypal } = this._window;
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const storeConfig = state.config.getStoreConfigOrThrow();
        let updatedPaypalOptions: BraintreePaypalButtonInitializeOptions;
        const isMessageContainerAvailable = Boolean(messagingContainerId && document.getElementById(messagingContainerId));
        const ppsdkFeatureOn = storeConfig?.checkoutSettings.features['PAYPAL-1149.braintree-new-card-below-totals-banner-placement'];

        if (paypal) {
            const FUNDING_SOURCES = [];
            for (const fundingKey in paypal.FUNDING) {
                if (paypal.FUNDING.hasOwnProperty(fundingKey)) {
                    const skipCreditSource = (fundingKey === 'CREDIT' || fundingKey === 'PAYLATER') && !paypalOptions.allowCredit;
                    if (fundingKey === 'CARD' || skipCreditSource) {
                        continue;
                    }
                    FUNDING_SOURCES.push(fundingKey.toLowerCase());
                }
            }

            if (paypalOptions) {
                updatedPaypalOptions = this._validateHeight(paypalOptions);
            }

            FUNDING_SOURCES.forEach(source => {
                const button = paypal.Buttons({
                    env: paymentMethod.config.testMode ? 'sandbox' : 'production',
                    fundingSource: source,
                    commit: false,
                    style: {
                        shape: 'rect',
                        label: this._offerCredit ? 'credit' : undefined,
                        ...pick(updatedPaypalOptions.style, 'layout', 'size', 'color', 'label', 'shape', 'tagline', 'fundingicons', 'height'),
                    },
                    createOrder: () => this._setupPayment(paypalCheckoutInstance, paypalOptions.shippingAddress, paypalOptions.onPaymentError),
                    onApprove: (data: PaypalAuthorizeData) => this._tokenizePayment(data, paypalCheckoutInstance, paypalOptions.shouldProcessPayment, paypalOptions.onAuthorizeError),
                });

                if (button.isEligible()) {
                    button.render(container);
                }
            });
            if (isMessageContainerAvailable && ppsdkFeatureOn && messagingContainerId) {
                this._renderMessages(cart.cartAmount, messagingContainerId);
            }
        }
    }

    deinitialize(): Promise<void> {
        this._paymentMethod = undefined;
        this._paypalCheckout = undefined;

        this._braintreeSDKCreator.teardown();

        return Promise.resolve();
    }

    private _renderMessages(amount: number, containerId: string) {
        const { paypal } = this._window;
        if (!paypal?.Messages) {
            return;
        }

        return paypal.Messages({
            amount,
            placement: 'cart',
        }).render(`#${containerId}`);
    }

    private _validateHeight(paypalOptions: BraintreePaypalButtonInitializeOptions): BraintreePaypalButtonInitializeOptions {
        const updatedPaypalOptions = {...paypalOptions};
        const { style } = updatedPaypalOptions;
        const { height } = style as PaypalButtonStyleOptions;

        if (updatedPaypalOptions.style) {
            if (typeof height === 'number') {
                updatedPaypalOptions.style.height = height < 25
                    ? 25
                    : (height > 55 ? 55 : height);
            } else {
                delete updatedPaypalOptions.style.height;
            }
        }

        return updatedPaypalOptions;
    }

    private _setupPayment(
        paypalCheckoutInstance: PaypalClientInstance,
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
