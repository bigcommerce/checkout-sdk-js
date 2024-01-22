import {
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import isStripeAcceleratedCheckoutCustomer from './is-stripe-accelerated-checkout-customer';
import {
    isStripeUPEPaymentMethodLike,
    StripeElements,
    StripeElementType,
    StripeEventType,
    StripeFormMode,
    StripeUPEAppearanceOptions,
    StripeUPEClient,
} from './stripe-upe';
import StripeUPEScriptLoader from './stripe-upe-script-loader';
import { WithStripeUPECustomerInitializeOptions } from './stripeupe-customer-initialize-options';

export default class StripeUPECustomerStrategy implements CustomerStrategy {
    private _stripeElements?: StripeElements;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeUPEScriptLoader,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithStripeUPECustomerInitializeOptions,
    ): Promise<void> {
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

        await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
            params: { method: methodId },
        });

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId, gatewayId);
        const { clientToken } = paymentMethod;

        if (!isStripeUPEPaymentMethodLike(paymentMethod) || !clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
        }

        const {
            initializationData: { stripePublishableKey, stripeConnectedAccount },
        } = paymentMethod;

        const { email } = state.getCustomerOrThrow();
        const paymentProviderCustomer = state.getPaymentProviderCustomerOrThrow();
        const stripePaymentProviderCustomer = isStripeAcceleratedCheckoutCustomer(
            paymentProviderCustomer,
        )
            ? paymentProviderCustomer
            : {};
        const stripeLinkAuthenticationState =
            stripePaymentProviderCustomer.stripeLinkAuthenticationState;

        if (!email) {
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

            stripeUPEClient = await this.scriptLoader.getStripeClient(
                stripePublishableKey,
                stripeConnectedAccount,
            );

            this._stripeElements = this.scriptLoader.getElements(stripeUPEClient, {
                clientSecret: clientToken,
                appearance,
            });

            const { getBillingAddress, getConsignments } =
                this.paymentIntegrationService.getState();
            const consignments = getConsignments();
            const id = consignments?.[0]?.id;
            const { email: billingEmail } = getBillingAddress() || {};
            const options = billingEmail
                ? { defaultValues: { mode: StripeFormMode.SHIPPING, email: billingEmail } }
                : {};
            const linkAuthenticationElement =
                this._stripeElements.getElement(StripeElementType.AUTHENTICATION) ||
                this._stripeElements.create(StripeElementType.AUTHENTICATION, options);

            linkAuthenticationElement.on('change', (event: StripeEventType) => {
                if (!('authenticated' in event)) {
                    throw new MissingDataError(MissingDataErrorType.MissingCustomer);
                }

                this.paymentIntegrationService.updatePaymentProviderCustomer({
                    stripeLinkAuthenticationState: event.authenticated,
                });

                if (event.complete) {
                    onEmailChange(event.authenticated, event.value.email);
                } else {
                    onEmailChange(false, '');
                }

                if (isLoading) {
                    isLoading(false);
                }

                if (stripeLinkAuthenticationState === undefined && event.authenticated && id) {
                    this.paymentIntegrationService.deleteConsignment(id);
                }
            });
            linkAuthenticationElement.mount(`#${container}`);
        }
    }

    deinitialize(): Promise<void> {
        this._stripeElements?.getElement(StripeElementType.AUTHENTICATION)?.unmount();

        return Promise.resolve();
    }

    signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void> {
        this.paymentIntegrationService.signInCustomer(credentials, options);

        return Promise.resolve();
    }

    signOut(options?: RequestOptions): Promise<void> {
        this.paymentIntegrationService.signOutCustomer(options);

        return Promise.resolve();
    }

    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<void> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve();
    }
}
