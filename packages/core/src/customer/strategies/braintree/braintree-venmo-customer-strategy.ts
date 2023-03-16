import { FormPoster } from '@bigcommerce/form-poster';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import mapToLegacyBillingAddress from '../../../checkout-buttons/strategies/braintree/map-to-legacy-billing-address';
import mapToLegacyShippingAddress from '../../../checkout-buttons/strategies/braintree/map-to-legacy-shipping-address';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    UnsupportedBrowserError,
} from '../../../common/error/errors';
import { PaymentMethodActionCreator, PaymentStrategyType } from '../../../payment';
import {
    BraintreeError,
    BraintreeSDKCreator,
    BraintreeTokenizePayload,
    BraintreeVenmoCheckout,
} from '../../../payment/strategies/braintree';
import CustomerActionCreator from '../../customer-action-creator';
import CustomerCredentials from '../../customer-credentials';
import {
    CustomerInitializeOptions,
    CustomerRequestOptions,
    ExecutePaymentMethodCheckoutOptions,
} from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

const VENMO_BUTTON_STYLE = {
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
};

const VENMO_BUTTON_STYLE_HOVER = {
    backgroundColor: '#0a7fc2',
};

export default class BraintreeVenmoCustomerStrategy implements CustomerStrategy {
    constructor(
        private _store: CheckoutStore,
        private _customerActionCreator: CustomerActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _formPoster: FormPoster,
    ) {}

    async initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { braintreevenmo, methodId } = options;
        const { container, onError } = braintreevenmo || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!container) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "braintreevenmo.container" argument is not provided.`,
            );
        }

        const state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId),
        );
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._braintreeSDKCreator.initialize(paymentMethod.clientToken);
        await this._braintreeSDKCreator.getVenmoCheckout(
            (braintreeVenmoCheckout) =>
                this._renderVenmoButton(braintreeVenmoCheckout, container, onError),
            (error) => this._handleInitializationVenmoError(error, container, onError),
        );

        return this._store.getState();
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._braintreeSDKCreator.teardown();

        return Promise.resolve(this._store.getState());
    }

    signIn(
        credentials: CustomerCredentials,
        options?: CustomerRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._customerActionCreator.signInCustomer(credentials, options),
        );
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._customerActionCreator.signOutCustomer(options));
    }

    executePaymentMethodCheckout(
        options?: ExecutePaymentMethodCheckoutOptions,
    ): Promise<InternalCheckoutSelectors> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve(this._store.getState());
    }

    private _handleError(
        error: BraintreeError | UnsupportedBrowserError,
        onError?: (error: BraintreeError | UnsupportedBrowserError) => void,
    ) {
        if (onError) {
            onError(error);
        } else {
            throw new Error(error.message);
        }
    }

    private _handleInitializationVenmoError(
        error: BraintreeError | UnsupportedBrowserError,
        containerId: string,
        onError?: (error: BraintreeError | UnsupportedBrowserError) => void,
    ): void {
        this._removeVenmoContainer(containerId);

        this._handleError(error, onError);
    }

    private _removeVenmoContainer(containerId: string): void {
        const buttonContainer = document.getElementById(containerId);

        if (buttonContainer) {
            buttonContainer.remove();
        }
    }

    private _renderVenmoButton(
        braintreeVenmoCheckout: BraintreeVenmoCheckout,
        containerId: string,
        onError?: (error: BraintreeError | UnsupportedBrowserError) => void,
    ): void {
        const venmoButton = document.getElementById(containerId);

        if (!venmoButton) {
            throw new InvalidArgumentError(
                'Unable to create wallet button without valid container ID.',
            );
        }

        venmoButton.setAttribute('aria-label', 'Venmo');
        Object.assign(venmoButton.style, VENMO_BUTTON_STYLE);

        venmoButton.addEventListener('click', async () => {
            venmoButton.setAttribute('disabled', 'true');

            if (braintreeVenmoCheckout.tokenize) {
                braintreeVenmoCheckout.tokenize(
                    async (error: BraintreeError, payload: BraintreeTokenizePayload) => {
                        venmoButton.removeAttribute('disabled');

                        if (error) {
                            return this._handleError(error, onError);
                        }

                        await this._handlePostForm(payload);
                    },
                );
            }
        });

        venmoButton.addEventListener('mouseenter', () => {
            venmoButton.style.backgroundColor = VENMO_BUTTON_STYLE_HOVER.backgroundColor;
        });

        venmoButton.addEventListener('mouseleave', () => {
            venmoButton.style.backgroundColor = VENMO_BUTTON_STYLE.backgroundColor;
        });
    }

    private async _handlePostForm(payload: BraintreeTokenizePayload): Promise<void> {
        const { deviceData } = await this._braintreeSDKCreator.getDataCollector();
        const { nonce, details } = payload;

        this._formPoster.postForm('/checkout.php', {
            nonce,
            provider: PaymentStrategyType.BRAINTREE_VENMO,
            payment_type: PaymentStrategyType.PAYPAL,
            device_data: deviceData,
            action: 'set_external_checkout',
            billing_address: JSON.stringify(mapToLegacyBillingAddress(details)),
            shipping_address: JSON.stringify(mapToLegacyShippingAddress(details)),
        });
    }
}
