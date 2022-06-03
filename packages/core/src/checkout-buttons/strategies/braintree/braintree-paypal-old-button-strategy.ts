import { FormPoster } from '@bigcommerce/form-poster';

import { Address, LegacyAddress } from '../../../address';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, StandardError, UnsupportedBrowserError } from '../../../common/error/errors';
import { PaymentMethod } from '../../../payment';
import { BraintreeError, BraintreePaypalCheckout, BraintreeShippingAddressOverride, BraintreeSDKCreator, BraintreeTokenizePayload, BraintreeVenmoCheckout, RenderButtonsData } from '../../../payment/strategies/braintree';
import { PaypalAuthorizeData, PaypalButtonStyleLabelOption, PaypalHostWindow } from '../../../payment/strategies/paypal';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';
import { CheckoutButtonMethodType } from '../index';

import getValidButtonStyle from './get-valid-button-style';

export default class BraintreePaypalOldButtonStrategy implements CheckoutButtonStrategy {
    private _paymentMethod?: PaymentMethod;
    private _renderButtonsData?: RenderButtonsData;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _formPoster: FormPoster,
        private _offerCredit: boolean = false,
        private _window: PaypalHostWindow
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const paypalOptions = (this._offerCredit ? options.braintreepaypalcredit : options.braintreepaypal) || {};
        const state = this._store.getState();
        const paymentMethod = this._paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);
        const isVenmoEnabled = paymentMethod?.initializationData?.isBraintreeVenmoEnabled;
        const storeState = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        const currency = storeState.cart.getCartOrThrow().currency.code;

        if (!paymentMethod || !paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._braintreeSDKCreator.initialize(paymentMethod.clientToken);
        const container = `#${options.containerId}`;
        const messagingContainerId = options.braintreepaypal?.messagingContainerId;
        const venmoParentContainer = options.containerId;

        this._renderButtonsData = {
            paymentMethod,
            paypalOptions,
            container,
            messagingContainerId,
            venmoParentContainer,
        };

        await this._braintreeSDKCreator.getPaypalCheckout(
            { currency },
            (braintreePaypalCheckout: BraintreePaypalCheckout) => this._renderButtons(braintreePaypalCheckout),
            error => this._handleError(error)
        );

        await this._braintreeSDKCreator.getPaypal();

        if (isVenmoEnabled) {
            await this._braintreeSDKCreator.getVenmoCheckout(
                braintreeVenmoCheckout => this._renderVenmoButton(braintreeVenmoCheckout),
                error => this._handleError(error)
            );
        }
    }

    deinitialize(): Promise<void> {
        this._paymentMethod = undefined;

        this._braintreeSDKCreator.teardown();

        return Promise.resolve();
    }

    private _renderButtons(braintreePaypalCheckout: BraintreePaypalCheckout) {
        const { paypalOptions, paymentMethod, container, messagingContainerId } = this._renderButtonsData as RenderButtonsData;
        const { style } = paypalOptions;
        const { paypal } = this._window;
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const storeConfig = state.config.getStoreConfigOrThrow();
        const isMessageContainerAvailable = Boolean(messagingContainerId && document.getElementById(messagingContainerId));
        const ppsdkFeatureOn = storeConfig?.checkoutSettings.features['PAYPAL-1149.braintree-new-card-below-totals-banner-placement'];

        if (paypal) {
            const FUNDING_SOURCES = [];
            for (const fundingKey in paypal.FUNDING) {
                if (Object.prototype.hasOwnProperty.call(paypal.FUNDING, fundingKey)) {
                    const skipCreditSource = (fundingKey === 'CREDIT' || fundingKey === 'PAYLATER') && !paypalOptions.allowCredit;
                    if (fundingKey === 'CARD' || skipCreditSource) {
                        continue;
                    }
                    FUNDING_SOURCES.push(fundingKey.toLowerCase());
                }
            }

            const commonButtonStyle = style ? getValidButtonStyle(style) : {};

            FUNDING_SOURCES.forEach(source => {
                const buttonStyle =
                    source === paypal.FUNDING.CREDIT && this._offerCredit
                        ? { label: PaypalButtonStyleLabelOption.CREDIT, ...commonButtonStyle }
                        : commonButtonStyle;

                const button = paypal.Buttons({
                    env: paymentMethod.config.testMode ? 'sandbox' : 'production',
                    fundingSource: source,
                    commit: false,
                    style: buttonStyle,
                    createOrder: () => this._setupPayment(braintreePaypalCheckout, paypalOptions.shippingAddress, paypalOptions.onPaymentError),
                    onApprove: (data: PaypalAuthorizeData) => this._tokenizePayment(data, braintreePaypalCheckout, paypalOptions.shouldProcessPayment, paypalOptions.onAuthorizeError),
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

    private _renderVenmoButton(braintreeVenmoCheckout: BraintreeVenmoCheckout) {
        const venmoContainer = this._renderButtonsData?.venmoParentContainer;
        const venmoButton = document.createElement('div');
        if (venmoContainer) {
            const buttonContainer = document.getElementById(venmoContainer);
            buttonContainer?.appendChild(venmoButton);
            venmoButton.setAttribute('id', 'venmo-button');
            venmoButton.addEventListener('click', () =>  {
                venmoButton.setAttribute('disabled', 'true');
                if (braintreeVenmoCheckout.tokenize) {
                    braintreeVenmoCheckout.tokenize((error: BraintreeError, payload: BraintreeTokenizePayload) => {
                        venmoButton.removeAttribute('disabled');
                        if (error) {
                            return  this._handleVenmoError(error);
                        }

                        return  this._handleSuccess(payload);
                    });
                }
            });
        }
    }

    private _handleSuccess(payload: BraintreeTokenizePayload) {
        Promise.all([
            this._braintreeSDKCreator.getDataCollector(),
        ]).then(([{ deviceData }]) => {
            this._formPoster.postForm('/checkout.php', {
                payment_type: 'paypal',
                provider: CheckoutButtonMethodType.BRAINTREE_VENMO,
                action: 'set_external_checkout',
                nonce: payload.nonce,
                device_data: deviceData,
                shipping_address: JSON.stringify(this._mapToLegacyShippingAddress(payload)),
                billing_address: JSON.stringify(this._mapToLegacyBillingAddress(payload)),
            });
        });

        return payload;
    }

    private _handleError(error: BraintreeError | UnsupportedBrowserError) {
        throw new Error(error.message);
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

    private _setupPayment(
        braintreePaypalCheckout: BraintreePaypalCheckout,
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

                return braintreePaypalCheckout.createPayment({
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
        braintreePaypalCheckout: BraintreePaypalCheckout,
        shouldProcessPayment?: boolean,
        onError?: (error: BraintreeError | StandardError) => void
    ): Promise<BraintreeTokenizePayload> {
        if (!this._paymentMethod || !braintreePaypalCheckout) {
            throw new NotInitializedError(NotInitializedErrorType.CheckoutButtonNotInitialized);
        }

        const methodId = this._paymentMethod.id;

        return Promise.all([
            braintreePaypalCheckout.tokenizePayment(data),
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
