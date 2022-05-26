import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { PaymentMethodActionCreator } from '../../../payment';
import { StripeElements, StripeElementType, StripeEvent, StripeScriptLoader, StripeUPEClient } from '../../../payment/strategies/stripe-upe';
import CustomerActionCreator from '../../customer-action-creator';
import CustomerCredentials from '../../customer-credentials';
import { CustomerInitializeOptions, CustomerRequestOptions, ExecutePaymentMethodCheckoutOptions } from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

export default class StripeUPECustomerStrategy implements CustomerStrategy {
    private _stripeElements?: StripeElements;

    constructor(
        private _store: CheckoutStore,
        private _stripeUPEScriptLoader: StripeScriptLoader,
        private _customerActionCreator: CustomerActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator
    ) {}

    async initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId = '', stripeupe: { container, onEmailChange } = {} } = options;
        let stripeUPEClient: StripeUPEClient;

        const {
            paymentMethods: { getPaymentMethodOrThrow }, customer: { getCustomerOrThrow },
        } = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId, { params: { method: 'card' } })
        );
        const {
            clientToken, initializationData: { stripePublishableKey, stripeConnectedAccount } = {}
        } = getPaymentMethodOrThrow('card', methodId);
        const { email } = getCustomerOrThrow();

        if (!email) {
            if (!stripePublishableKey || !clientToken) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
            }

            stripeUPEClient = await this._stripeUPEScriptLoader.getStripeClient(stripePublishableKey, stripeConnectedAccount);

            this._stripeElements = this._stripeUPEScriptLoader.getElements(stripeUPEClient, {
                clientSecret: clientToken,
                appearance: {},
            });

            const linkAuthenticationElement = this._stripeElements.getElement(StripeElementType.AUTHENTICATION) || this._stripeElements.create(StripeElementType.AUTHENTICATION);

            linkAuthenticationElement.on('change', (event: StripeEvent) => {
                if (onEmailChange) {
                    event.complete ? onEmailChange(event.value.email) : onEmailChange('');
                }
            });

            linkAuthenticationElement.mount(`#${container}`);
        }

        return this._store.getState();
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._stripeElements?.getElement(StripeElementType.AUTHENTICATION)?.unmount();

        return Promise.resolve(this._store.getState());
    }

    signIn(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._customerActionCreator.signInCustomer(credentials, options)
        );
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._customerActionCreator.signOutCustomer(options)
        );
    }

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<InternalCheckoutSelectors> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve(this._store.getState());
    }
}
