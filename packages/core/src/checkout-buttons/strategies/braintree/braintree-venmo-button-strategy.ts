import { FormPoster } from '@bigcommerce/form-poster';
import { noop } from 'lodash';

import { CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, UnsupportedBrowserError } from '../../../common/error/errors';
import { PaymentMethodActionCreator } from '../../../payment';
import { BraintreeError, BraintreeSDKCreator, BraintreeTokenizePayload, BraintreeVenmoCheckout } from '../../../payment/strategies/braintree';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';
import { CheckoutButtonMethodType } from '../index';

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

export default class BraintreeVenmoButtonStrategy implements CheckoutButtonStrategy {
    private _onError = noop;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _formPoster: FormPoster
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { braintreevenmo, containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.methodId" argument is not provided.');
        }

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!containerId) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.containerId" argument is not provided.`);
        }

        this._onError = braintreevenmo?.onError || this._handleError;

        this._braintreeSDKCreator.initialize(paymentMethod.clientToken);
        await this._braintreeSDKCreator.getVenmoCheckout(
            braintreeVenmoCheckout => this._handleInitializationVenmoSuccess(braintreeVenmoCheckout, containerId),
            error => this._handleInitializationVenmoError(error, containerId)
        );
    }

    deinitialize(): Promise<void> {
        this._braintreeSDKCreator.teardown();

        return Promise.resolve();
    }

    private _handleError(error: BraintreeError) {
        throw new Error(error.message);
    }

    private _handleInitializationVenmoSuccess(braintreeVenmoCheckout: BraintreeVenmoCheckout, parentContainerId: string): void {
        return this._renderVenmoButton(braintreeVenmoCheckout, parentContainerId);
    }

    private _handleInitializationVenmoError(error: BraintreeError | UnsupportedBrowserError, containerId: string): void {
        this._hideVenmoContainer(containerId);

        return this._onError(error);
    }

    private _hideVenmoContainer(containerId: string): void {
        const buttonContainer = document.getElementById(containerId);
        Object.assign(buttonContainer?.style, { display: 'none' });
    }

    private _renderVenmoButton(braintreeVenmoCheckout: BraintreeVenmoCheckout, containerId: string): void {
        const venmoButton = document.getElementById(containerId);

        if (!venmoButton) {
            throw new InvalidArgumentError('Unable to create wallet button without valid container ID.');
        }

        venmoButton.setAttribute('aria-label', 'Venmo');
        Object.assign(venmoButton.style, venmoButtonStyle);

        venmoButton.addEventListener('click', () =>  {
            venmoButton.setAttribute('disabled', 'true');

            if (braintreeVenmoCheckout.tokenize) {
                braintreeVenmoCheckout.tokenize(async (error: BraintreeError, payload: BraintreeTokenizePayload) => {
                    venmoButton.removeAttribute('disabled');

                    if (error) {
                        return this._onError(error);
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
}
