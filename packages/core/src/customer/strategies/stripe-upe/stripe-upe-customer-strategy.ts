import { createAction } from '@bigcommerce/data-store';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
} from '../../../common/error/errors';
import { PaymentMethodActionCreator } from '../../../payment';
import {
    StripeElements,
    StripeElementType,
    StripeEventType,
    StripeScriptLoader,
    StripeUPEAppearanceOptions,
    StripeUPEClient,
} from '../../../payment/strategies/stripe-upe';
import { ConsignmentActionCreator } from '../../../shipping';
import CustomerActionCreator from '../../customer-action-creator';
import { CustomerActionType } from '../../customer-actions';
import CustomerCredentials from '../../customer-credentials';
import {
    CustomerInitializeOptions,
    CustomerRequestOptions,
    ExecutePaymentMethodCheckoutOptions,
} from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

export default class StripeUPECustomerStrategy implements CustomerStrategy {
    private _stripeElements?: StripeElements;

    constructor(
        private _store: CheckoutStore,
        private _stripeUPEScriptLoader: StripeScriptLoader,
        private _customerActionCreator: CustomerActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
    ) {}

    async initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        let stripeUPEClient: StripeUPEClient;

        if (!options.stripeupe) {
            throw new InvalidArgumentError(
                `Unable to proceed because "options" argument is not provided.`,
            );
        }

        const { container, gatewayId, methodId, onEmailChange, getStyles, isLoading } =
            options.stripeupe;

        Object.entries(options.stripeupe).forEach(([key, value]) => {
            if (!value) {
                throw new InvalidArgumentError(
                    `Unable to proceed because "${key}" argument is not provided.`,
                );
            }
        });

        const {
            paymentMethods: { getPaymentMethodOrThrow },
            customer: { getCustomerOrThrow },
        } = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(gatewayId, {
                params: { method: methodId },
            }),
        );
        const {
            clientToken,
            initializationData: { stripePublishableKey, stripeConnectedAccount } = {},
        } = getPaymentMethodOrThrow(methodId, gatewayId);
        const { email, isStripeLinkAuthenticated } = getCustomerOrThrow();

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
                    },
                };
            } else {
                appearance = {};
            }

            stripeUPEClient = await this._stripeUPEScriptLoader.getStripeClient(
                stripePublishableKey,
                stripeConnectedAccount,
            );

            this._stripeElements = this._stripeUPEScriptLoader.getElements(stripeUPEClient, {
                clientSecret: clientToken,
                appearance,
            });

            const {
                billingAddress: { getBillingAddress },
                consignments: { getConsignmentsOrThrow },
            } = this._store.getState();
            const { id } = getConsignmentsOrThrow()[0] || '';
            const { email: billingEmail } = getBillingAddress() || {};
            const options = billingEmail ? { defaultValues: { email: billingEmail } } : {};
            const linkAuthenticationElement =
                this._stripeElements.getElement(StripeElementType.AUTHENTICATION) ||
                this._stripeElements.create(StripeElementType.AUTHENTICATION, options);

            linkAuthenticationElement.on('change', (event: StripeEventType) => {
                if (!('authenticated' in event)) {
                    throw new MissingDataError(MissingDataErrorType.MissingCustomer);
                }

                this._store.dispatch(
                    createAction(CustomerActionType.StripeLinkAuthenticated, event.authenticated),
                );
                event.complete
                    ? onEmailChange(event.authenticated, event.value.email)
                    : onEmailChange(false, '');

                if (isLoading) {
                    isLoading(false);
                }

                if (isStripeLinkAuthenticated === undefined && event.authenticated && id) {
                    this._store.dispatch(this._consignmentActionCreator.deleteConsignment(id));
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
}
