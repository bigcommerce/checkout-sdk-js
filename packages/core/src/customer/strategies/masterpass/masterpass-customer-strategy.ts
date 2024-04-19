import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotImplementedError,
} from '../../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import {
    formatLocale,
    getCallbackUrl,
    MasterpassScriptLoader,
} from '../../../payment/strategies/masterpass';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import {
    CustomerInitializeOptions,
    CustomerRequestOptions,
    ExecutePaymentMethodCheckoutOptions,
} from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

export default class MasterpassCustomerStrategy implements CustomerStrategy {
    private _signInButton?: HTMLElement;
    private _paymentMethod?: PaymentMethod;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _masterpassScriptLoader: MasterpassScriptLoader,
        private _locale: string,
    ) {}

    initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { masterpass: masterpassOptions, methodId } = options;

        if (!masterpassOptions || !methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "options.masterpass" argument is not provided.',
            );
        }

        return this._store
            .dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then((state) => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                if (!this._paymentMethod || !this._paymentMethod.initializationData.checkoutId) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                const cart = state.cart.getCart();

                if (!cart) {
                    throw new MissingDataError(MissingDataErrorType.MissingCart);
                }

                const { container } = masterpassOptions;

                const payload = {
                    checkoutId: this._paymentMethod.initializationData.checkoutId,
                    allowedCardTypes: this._paymentMethod.initializationData.allowedCardTypes,
                    amount: cart.cartAmount.toString(),
                    currency: cart.currency.code,
                    cartId: cart.id,
                    suppressShippingAddress: false,
                    callbackUrl: getCallbackUrl('checkout'),
                };

                const masterpassScriptLoaderParams = {
                    useMasterpassSrc: this._paymentMethod.initializationData.isMasterpassSrcEnabled,
                    language: formatLocale(this._locale),
                    testMode: this._paymentMethod.config.testMode,
                    checkoutId: this._paymentMethod.initializationData.checkoutId,
                };

                return this._masterpassScriptLoader
                    .load(masterpassScriptLoaderParams)
                    .then((Masterpass) => {
                        this._signInButton = this._createSignInButton(container);

                        this._signInButton.addEventListener('click', () => {
                            Masterpass.checkout(payload);
                        });
                    });
            })
            .then(() => this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._paymentMethod = undefined;

        if (this._signInButton && this._signInButton.parentNode) {
            this._signInButton.parentNode.removeChild(this._signInButton);
            this._signInButton = undefined;
        }

        return Promise.resolve(this._store.getState());
    }

    signIn(): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via Masterpass, the shopper must click on "Masterpass" button.',
        );
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const payment = state.payment.getPaymentId();

        if (!payment) {
            return Promise.resolve(this._store.getState());
        }

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.signOut(payment.providerId, options),
        );
    }

    executePaymentMethodCheckout(
        options?: ExecutePaymentMethodCheckoutOptions,
    ): Promise<InternalCheckoutSelectors> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve(this._store.getState());
    }

    private _createSignInButton(containerId: string): HTMLElement {
        const container = document.querySelector(`#${containerId}`);

        if (!this._paymentMethod || !this._paymentMethod.initializationData.checkoutId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!container) {
            throw new InvalidArgumentError(
                'Unable to create sign-in button without valid container ID.',
            );
        }

        const button = document.createElement('input');

        button.type = 'image';

        if (this._paymentMethod.initializationData.isMasterpassSrcEnabled) {
            const subdomain = this._paymentMethod.config.testMode ? 'sandbox.' : '';
            const { checkoutId } = this._paymentMethod.initializationData;

            const params = [
                `locale=${formatLocale(this._locale)}`,
                `paymentmethod=master,visa,amex,discover`,
                `checkoutid=${checkoutId}`,
            ];

            button.src = [
                `https://${subdomain}src.mastercard.com/assets/img/btn/src_chk_btn_126x030px.svg`,
                params.join('&'),
            ].join('?');
        } else {
            button.src =
                'https://static.masterpass.com/dyn/img/btn/global/mp_chk_btn_160x037px.svg';
        }

        container.appendChild(button);

        return button;
    }
}
