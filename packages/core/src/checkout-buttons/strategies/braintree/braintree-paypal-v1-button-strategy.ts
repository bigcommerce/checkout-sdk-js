import { FormPoster } from '@bigcommerce/form-poster';

import { Address } from '../../../address';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, StandardError, UnsupportedBrowserError } from '../../../common/error/errors';
import { mapToBraintreeShippingAddressOverride, BraintreeError, BraintreePaypalCheckout, BraintreeSDKCreator, BraintreeTokenizePayload, BraintreeVenmoCheckout } from '../../../payment/strategies/braintree';
import { PaypalAuthorizeData, PaypalButtonStyleLabelOption, PaypalHostWindow } from '../../../payment/strategies/paypal';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';
import { CheckoutButtonMethodType } from '../index';

import { BraintreePaypalV1ButtonInitializeOptions } from './braintree-paypal-v1-button-options';
import getValidButtonStyle from './get-valid-button-style';
import mapToLegacyBillingAddress from './map-to-legacy-billing-address';
import mapToLegacyShippingAddress from './map-to-legacy-shipping-address';

const venmoButtonStyle = {
    backgroundColor: '#3D95CE',
    backgroundPosition: '50% 50%',
    backgroundSize: '80px auto',
    backgroundImage: 'url("/app/assets/img/payment-providers/venmo-logo-white.svg")',
    backgroundRepeat: 'no-repeat',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: '0.2s ease',
    minHeight: '40px',
    minWidth: '150px',
    height: '100%',
    width: '100%',
};

const venmoButtonStyleHover = {
    backgroundColor: '#0a7fc2',
};

export default class BraintreePaypalV1ButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _formPoster: FormPoster,
        private _offerCredit: boolean = false,
        private _window: PaypalHostWindow
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { braintreepaypal, braintreepaypalcredit, containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.methodId" argument is not provided.');
        }

        if (!containerId) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.containerId" argument is not provided.`);
        }

        if (this._offerCredit && !braintreepaypalcredit) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.braintreepaypalcredit" argument is not provided.`);
        }

        if (!this._offerCredit && !braintreepaypal) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.braintreepaypal" argument is not provided.`);
        }

        const state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        const currency = state.cart.getCartOrThrow()?.currency.code;
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);

        const providerOptions = (this._offerCredit ? braintreepaypalcredit : braintreepaypal) || {};

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const errorCallback = (error: BraintreeError | UnsupportedBrowserError) => providerOptions?.onError?.(error);
        const venmoCheckoutCallback = (braintreeVenmoCheckout: BraintreeVenmoCheckout) => this._renderVenmoComponent(braintreeVenmoCheckout, containerId, errorCallback);
        const paypalCheckoutCallback = (braintreePaypalCheckout: BraintreePaypalCheckout) =>
            this._renderPaypalComponents(
                braintreePaypalCheckout,
                providerOptions,
                containerId,
                methodId,
                Boolean(paymentMethod.config.testMode)
            );

        this._braintreeSDKCreator.initialize(paymentMethod.clientToken);
        await this._braintreeSDKCreator.getPaypalCheckout({ currency }, paypalCheckoutCallback, errorCallback);

        if (paymentMethod.initializationData.isBraintreeVenmoEnabled) {
            await this._braintreeSDKCreator.getVenmoCheckout(venmoCheckoutCallback, errorCallback);
        }
    }

    deinitialize(): Promise<void> {
        this._braintreeSDKCreator.teardown();

        return Promise.resolve();
    }

    private _renderPaypalComponents(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        providerOptions: BraintreePaypalV1ButtonInitializeOptions,
        containerId: string,
        methodId: string,
        testMode: boolean
    ): void {
        const { messagingContainerId } = providerOptions;

        this._renderPayPalMessages(messagingContainerId);
        this._renderPayPalButtons(braintreePaypalCheckout, providerOptions, containerId, methodId, testMode);
    }

    private _renderPayPalButtons(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        providerOptions: BraintreePaypalV1ButtonInitializeOptions,
        containerId: string,
        methodId: string,
        testMode: boolean
    ): void {
        const { allowCredit, style, shippingAddress, shouldProcessPayment, onAuthorizeError, onPaymentError } = providerOptions;

        const { paypal } = this._window;

        if (paypal) {
            const fundingSources = allowCredit
                ? [paypal.FUNDING.PAYPAL, paypal.FUNDING.PAYLATER, paypal.FUNDING.CREDIT]
                : [paypal.FUNDING.PAYPAL];

            const commonValidButtonStyle = style ? getValidButtonStyle(style) : {};

            fundingSources.forEach(fundingSource => {
                const buttonStyle = fundingSource === paypal.FUNDING.CREDIT
                    ? { label: PaypalButtonStyleLabelOption.CREDIT, ...commonValidButtonStyle }
                    : commonValidButtonStyle;

                const paypalButtonRender = paypal.Buttons({
                    env: testMode ? 'sandbox' : 'production',
                    commit: false,
                    fundingSource,
                    style: buttonStyle,
                    createOrder: () => this._setupPayment(braintreePaypalCheckout, shippingAddress, onPaymentError),
                    onApprove: (authorizeData: PaypalAuthorizeData) =>
                        this._tokenizePayment(authorizeData, braintreePaypalCheckout, methodId, shouldProcessPayment, onAuthorizeError),
                });

                if (paypalButtonRender.isEligible()) {
                    paypalButtonRender.render(`#${containerId}`);
                }
            });
        }
    }

    private _renderPayPalMessages(messagingContainerId?: string): void {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const storeConfig = state.config.getStoreConfigOrThrow();

        const isMessageContainerAvailable = messagingContainerId && !!document.getElementById(messagingContainerId);
        const isMessagesRenderingFeatureOn = storeConfig.checkoutSettings.features['PAYPAL-1149.braintree-new-card-below-totals-banner-placement'];

        const { paypal } = this._window;

        if (paypal && isMessagesRenderingFeatureOn && messagingContainerId && isMessageContainerAvailable) {
            const paypalMessagesRender = paypal.Messages({ amount: cart.cartAmount, placement: 'cart' });
            paypalMessagesRender.render(`#${messagingContainerId}`);
        } else {
            this._hideElement(messagingContainerId);
        }
    }

    private async _setupPayment(
        braintreePaypalCheckout: BraintreePaypalCheckout,
        shippingAddress?: Address | null,
        onError?: (error: BraintreeError | StandardError) => void
    ): Promise<string> {
        const state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());

        try {
            const checkout = state.checkout.getCheckoutOrThrow();
            const config = state.config.getStoreConfigOrThrow();
            const customer = state.customer.getCustomer();

            const address = shippingAddress || customer?.addresses?.[0];
            const shippingAddressOverride = address ? mapToBraintreeShippingAddressOverride(address) : undefined;

            return await braintreePaypalCheckout.createPayment({
                flow: 'checkout',
                enableShippingAddress: true,
                shippingAddressEditable: false,
                shippingAddressOverride,
                amount: checkout.outstandingBalance,
                currency: config.currency.code,
                offerCredit: this._offerCredit,
            });
        } catch (error) {
            if (onError) {
                onError(error);
            }

            throw error;
        }
    }

    private async _tokenizePayment(
        authorizeData: PaypalAuthorizeData,
        braintreePaypalCheckout: BraintreePaypalCheckout,
        methodId: string,
        shouldProcessPayment?: boolean,
        onError?: (error: BraintreeError | StandardError) => void
    ): Promise<BraintreeTokenizePayload> {
        try {
            const { deviceData } = await this._braintreeSDKCreator.getDataCollector({ paypal: true });
            const tokenizePayload = await braintreePaypalCheckout.tokenizePayment(authorizeData);
            const { details, nonce } = tokenizePayload;

            this._formPoster.postForm('/checkout.php', {
                payment_type: 'paypal',
                provider: methodId,
                action: shouldProcessPayment ? 'process_payment' : 'set_external_checkout',
                nonce,
                device_data: deviceData,
                billing_address: JSON.stringify(mapToLegacyBillingAddress(details)),
                shipping_address: JSON.stringify(mapToLegacyShippingAddress(details)),
            });

            return tokenizePayload;
        } catch (error) {
            if (onError) {
                onError(error);
            }

            throw error;
        }
    }

    private _renderVenmoComponent(
        braintreeVenmoCheckout: BraintreeVenmoCheckout,
        containerId: string,
        onError?: (error: BraintreeError | StandardError) => void
    ): void {
        const venmoButtonParentContainer = document.getElementById(containerId);

        if (!venmoButtonParentContainer) {
            throw new InvalidArgumentError('Unable to create wallet button without valid container ID.');
        }

        const venmoButton = document.createElement('div');
        venmoButtonParentContainer?.appendChild(venmoButton);
        venmoButton.setAttribute('aria-label', 'Venmo');
        Object.assign(venmoButton.style, venmoButtonStyle);

        venmoButton.addEventListener('click', () =>  {
            venmoButton.setAttribute('disabled', 'true');

            if (braintreeVenmoCheckout.tokenize) {
                braintreeVenmoCheckout.tokenize(async (error: BraintreeError, payload: BraintreeTokenizePayload) => {
                    venmoButton.removeAttribute('disabled');

                    if (error && onError) {
                        return onError(error);
                    }

                    await this._handlePostForm(payload);
                });
            }
        });

        venmoButton.addEventListener('mouseenter', () => {
            venmoButton.style.backgroundColor = venmoButtonStyleHover.backgroundColor;
        });

        venmoButton.addEventListener('mouseleave', () => {
            venmoButton.style.backgroundColor = venmoButtonStyle.backgroundColor;
        });
    }

    private async _handlePostForm(payload: BraintreeTokenizePayload): Promise<void> {
        const { deviceData } = await this._braintreeSDKCreator.getDataCollector();
        const { nonce, details } = payload;

        this._formPoster.postForm('/checkout.php', {
            nonce,
            provider: CheckoutButtonMethodType.BRAINTREE_VENMO,
            payment_type: 'paypal',
            device_data: deviceData,
            action: 'set_external_checkout',
            billing_address: JSON.stringify(mapToLegacyBillingAddress(details)),
            shipping_address: JSON.stringify(mapToLegacyShippingAddress(details)),
        });
    }

    private _hideElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            Object.assign(element?.style, { display: 'none' });
        }
    }
}
