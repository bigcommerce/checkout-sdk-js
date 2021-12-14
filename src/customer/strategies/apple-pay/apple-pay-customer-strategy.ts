import { bindDecorator as bind } from '../../../common/utility';
import { Cart } from "../../../cart";
import { Checkout, CheckoutStore } from "../../../checkout";
import InternalCheckoutSelectors from "../../../checkout/internal-checkout-selectors";
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotImplementedError } from "../../../common/error/errors";
import { StoreConfig } from "../../../config";
import { PaymentMethod, PaymentMethodActionCreator } from "../../../payment";
import { ApplePaySessionFactory } from "../../../payment/strategies/apple-pay";
import { RemoteCheckoutActionCreator } from "../../../remote-checkout";
import { CustomerInitializeOptions, CustomerRequestOptions, ExecutePaymentMethodCheckoutOptions } from "../../customer-request-options";
import CustomerStrategy from "../customer-strategy";

enum DefaultLabels {
    Shipping = 'Shipping',
    Subtotal = 'Subtotal',
}

export default class ApplePayCustomerStrategy implements CustomerStrategy {
    private _paymentMethod?: PaymentMethod;
    private _applePayButton?: HTMLElement;
    private _shippingLabel: string = DefaultLabels.Shipping;
    private _subTotalLabel: string = DefaultLabels.Subtotal;

    constructor(
        private _store: CheckoutStore,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _sessionFactory: ApplePaySessionFactory
    ) {}

    async initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        console.log('Initialize called', options);
        const { methodId, applepay }  = options;

        if (!methodId || !applepay) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { container } = applepay;

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        this._paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        this._applePayButton = this._createButton(container);
        this._applePayButton.addEventListener('click', this._handleWalletButtonClick);

        return this._store.getState();
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    signIn(): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via Apple, the shopper must click on "Apple Pay" button.'
        );
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const payment = state.payment.getPaymentId();

        if (!payment) {
            return Promise.resolve(this._store.getState());
        }

        return this._store.dispatch(this._remoteCheckoutActionCreator.forgetCheckout(payment.providerId, options));
    }

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<InternalCheckoutSelectors> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve(this._store.getState());
    }

    private _createButton(containerId: string): HTMLElement {
        const container = document.getElementById(containerId);

        if (!container) {
            throw new InvalidArgumentError('Unable to create sign-in button without valid container ID.');
        }

        const button = document.createElement('input');
        button.type = 'image';
        button.src = this._paymentMethod?.logoUrl || '';
        button.style.height = '40px';
        button.style.width = '75px';
        container.appendChild(button);
        
        return button;
    }

    @bind
    private _handleWalletButtonClick(event: Event) {
        event.preventDefault();
        const state = this._store.getState();
        const checkout = state.checkout.getCheckoutOrThrow();
        const cart = state.cart.getCartOrThrow();
        const config = state.config.getStoreConfigOrThrow();
        const request = this._getBaseRequest(cart, checkout, config);
        const applePaySession = this._sessionFactory.create(request);

        applePaySession.begin();
    }

    private _getBaseRequest(
        cart: Cart,
        checkout: Checkout,
        config: StoreConfig,
    ): ApplePayJS.ApplePayPaymentRequest {
        const { storeProfile: { storeCountryCode, storeName } } = config;
        const { currency : { decimalPlaces } } = cart;
        if (!this._paymentMethod || !this._paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }
        const { initializationData : { merchantCapabilities, supportedNetworks } } = this._paymentMethod;
        const lineItems: ApplePayJS.ApplePayLineItem[] = [
            { label: this._subTotalLabel, amount: `${checkout.subtotal.toFixed(decimalPlaces)}`},
        ];

        checkout.taxes.forEach(tax =>
            lineItems.push({ label: tax.name, amount: `${tax.amount.toFixed()}` }));

        lineItems.push({ label: this._shippingLabel, amount: `${checkout.shippingCostTotal.toFixed(decimalPlaces)}`});

        return {
            countryCode: storeCountryCode,
            currencyCode: cart.currency.code,
            merchantCapabilities,
            supportedNetworks,
            lineItems,
            total: {
                label: storeName,
                amount: `${checkout.grandTotal.toFixed(cart.currency.decimalPlaces)}`,
                type: 'final',
            },
        };
    }
}
