import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { PaymentMethodActionCreator } from '../../../payment';
import { StripeElements, StripeElementType, StripeScriptLoader, StripeUPEClient, StripeEventType, StripeUPEAppearanceOptions } from '../../../payment/strategies/stripe-upe';
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
        const { stripeupe: { container, gatewayId, methodId, onEmailChange, getStyles, isLoading } = {} } = options;
        let stripeUPEClient: StripeUPEClient;

        if (!methodId || !gatewayId) {
            throw new InvalidArgumentError('Unable to proceed because "methodId " or "gatewayId" argument is not provided.');
        }

        const {
            paymentMethods: { getPaymentMethodOrThrow }, customer: { getCustomerOrThrow },
        } = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(gatewayId, { params: { method: methodId } })
        );
        const {
            clientToken, initializationData: { stripePublishableKey, stripeConnectedAccount } = {}
        } = getPaymentMethodOrThrow(methodId, gatewayId);
        const { email } = getCustomerOrThrow();

        if (!email) {
            if (!stripePublishableKey || !clientToken) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
            }

            let appearance: StripeUPEAppearanceOptions | undefined;
            const styles = typeof getStyles === 'function' && getStyles();

            if (styles) {
                appearance = {
                    variables: {
                        colorPrimary: styles.fieldInnerShadow,
                        colorBackground: styles.fieldBackground,
                        colorText: styles.labelText,
                        colorDanger: styles.fieldErrorText,
                        colorTextSecondary: styles.labelText,
                        colorTextPlaceholder: styles.fieldPlaceholderText,
                    },
                    rules: {
                        '.Input': {
                            borderColor: styles.fieldBorder,
                            color: styles.fieldText,
                            boxShadow: styles.fieldInnerShadow,
                        },
                    }
                };
            } else {
                appearance = {}
            }

            stripeUPEClient = await this._stripeUPEScriptLoader.getStripeClient(stripePublishableKey, stripeConnectedAccount);

            this._stripeElements = this._stripeUPEScriptLoader.getElements(stripeUPEClient, {
                clientSecret: clientToken,
                appearance,
            });

            const linkAuthenticationElement = this._stripeElements.getElement(StripeElementType.AUTHENTICATION) || this._stripeElements.create(StripeElementType.AUTHENTICATION);

            linkAuthenticationElement.on('change', (event: StripeEventType) => {
                if (!('authenticated' in event)) {
                    throw new MissingDataError(MissingDataErrorType.MissingCustomer);
                } else {
                    if (onEmailChange) {
                        event.complete ? onEmailChange(event.authenticated, event.value.email) : onEmailChange(false, '');
                    }
                    if (isLoading) {
                        isLoading(false);
                    }
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
