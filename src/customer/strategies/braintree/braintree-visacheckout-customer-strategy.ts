import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotImplementedError } from '../../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { BraintreeVisaCheckoutPaymentProcessor, VisaCheckoutPaymentSuccessPayload, VisaCheckoutScriptLoader } from '../../../payment/strategies/braintree';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { CustomerInitializeOptions, CustomerRequestOptions } from '../../customer-request-options';
import CustomerStrategyActionCreator from '../../customer-strategy-action-creator';
import CustomerStrategy from '../customer-strategy';

export default class BraintreeVisaCheckoutCustomerStrategy implements CustomerStrategy {
    private _paymentMethod?: PaymentMethod;
    private _buttonClassName: string = 'visa-checkout-wrapper';

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _customerStrategyActionCreator: CustomerStrategyActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _braintreeVisaCheckoutPaymentProcessor: BraintreeVisaCheckoutPaymentProcessor,
        private _visaCheckoutScriptLoader: VisaCheckoutScriptLoader
    ) {}

    initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { braintreevisacheckout: visaCheckoutOptions, methodId } = options;

        if (!visaCheckoutOptions || !methodId) {
            throw new InvalidArgumentError('Unable to proceed because "options.braintreevisacheckout" argument is not provided.');
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                const checkout = state.checkout.getCheckout();
                const storeConfig = state.config.getStoreConfig();

                if (!checkout) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                }

                if (!storeConfig) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                if (!this._paymentMethod || !this._paymentMethod.clientToken) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                const {
                    container,
                    onError = () => {},
                } = visaCheckoutOptions;

                const initOptions = {
                    locale: storeConfig.storeProfile.storeLanguage,
                    collectShipping: true,
                    subtotal: checkout.subtotal,
                    currencyCode: storeConfig.currency.code,
                };

                return Promise.all([
                    this._visaCheckoutScriptLoader.load(this._paymentMethod.config.testMode),
                    this._braintreeVisaCheckoutPaymentProcessor.initialize(this._paymentMethod.clientToken, initOptions),
                ])
                .then(([visaCheckout, initOptions]) => {
                    const signInButton = this._createSignInButton(container, this._buttonClassName);

                    visaCheckout.init(initOptions);
                    visaCheckout.on('payment.success', (paymentSuccessPayload: VisaCheckoutPaymentSuccessPayload) =>
                        this._paymentInstrumentSelected(paymentSuccessPayload)
                            .catch(error => onError(error))
                    );
                    visaCheckout.on('payment.error', (_, error) => onError(error));

                    return signInButton;
                })
                .then(signInButton => { signInButton.style.visibility = 'visible'; });
            })
            .then(() => this._store.getState());
    }

    signIn(): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via VisaCheckout, the shopper must click on "Visa Checkout" button.'
        );
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._remoteCheckoutActionCreator.signOut('braintreevisacheckout', options)
        );
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._paymentMethod = undefined;

        return this._braintreeVisaCheckoutPaymentProcessor.deinitialize()
            .then(() => this._store.getState());
    }

    private _paymentInstrumentSelected(paymentSuccessPayload: VisaCheckoutPaymentSuccessPayload) {
        const state = this._store.getState();

        if (!this._paymentMethod) {
            throw new Error('Payment method not initialized');
        }

        const { id: methodId } = this._paymentMethod;

        return this._store.dispatch(
            this._customerStrategyActionCreator.widgetInteraction(() => {
                return this._braintreeVisaCheckoutPaymentProcessor.handleSuccess(
                    paymentSuccessPayload,
                    state.shippingAddress.getShippingAddress(),
                    state.billingAddress.getBillingAddress()
                )
                .then(() => this._store.dispatch(this._checkoutActionCreator.loadCurrentCheckout()));
        }, { methodId }), { queueId: 'widgetInteraction' });
    }

    private _createSignInButton(containerId: string, buttonClass: string): HTMLElement {
        const container = document.querySelector(`#${containerId}`);

        if (!container) {
            throw new Error('Need a container to place the button');
        }

        return (container.querySelector('.' + buttonClass) as HTMLElement) ||
            this._insertVisaCheckoutButton(container, buttonClass);
    }

    private _insertVisaCheckoutButton(container: Element, buttonClass: string): HTMLElement {
        const buttonSource = 'https://secure.checkout.visa.com/wallet-services-web/xo/button.png?acceptCanadianVisaDebit=false&cobrand=true&size=154';
        const buttonTemplate = `
            <img
                alt="Visa Checkout"
                class="v-button"
                role="button"
                src="${buttonSource}"
                />
            <a class="v-learn v-learn-default" style="text-align: right; display: block; font-size: 10px; color: #003366;" href="#" data-locale="en_US">Tell Me More</a>`;

        const visaCheckoutButton = document.createElement('div');
        visaCheckoutButton.style.visibility = 'hidden';
        visaCheckoutButton.className = buttonClass;
        visaCheckoutButton.innerHTML = buttonTemplate;

        container.appendChild(visaCheckoutButton);

        return visaCheckoutButton;
    }
}
