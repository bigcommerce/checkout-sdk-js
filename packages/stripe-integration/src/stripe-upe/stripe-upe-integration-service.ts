import { includes, some } from 'lodash';

import {
    Address,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentIntegrationService,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { isStripeError } from './is-stripe-error';
import {
    AddressOptions,
    StripeAdditionalActionRequired,
    StripeConfirmPaymentData,
    StripeElement,
    StripeElements,
    StripeElementType,
    StripeError,
    StripeStringConstants,
    StripeUPEClient,
    StripeUPEPaymentIntentStatus,
} from './stripe-upe';
import StripeUPEPaymentInitializeOptions from './stripe-upe-initialize-options';
import StripeUPEScriptLoader from './stripe-upe-script-loader';

export default class StripeUPEIntegrationService {
    private isMounted = false;
    private checkoutEventsUnsubscribe?: () => void;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeUPEScriptLoader,
    ) {}

    deinitialize(): void {
        this.checkoutEventsUnsubscribe?.();
        this.isMounted = false;
    }

    initCheckoutEventsSubscription(
        gatewayId: string,
        methodId: string,
        stripeupe: StripeUPEPaymentInitializeOptions,
        stripeElements?: StripeElements,
    ): void {
        this.checkoutEventsUnsubscribe = this.paymentIntegrationService.subscribe(
            async () => {
                const paymentElement = stripeElements?.getElement(StripeElementType.PAYMENT);

                if (!paymentElement) {
                    return;
                }

                try {
                    await this.updateStripePaymentIntent(gatewayId, methodId);
                } catch (error) {
                    if (this.isMounted) {
                        paymentElement.unmount();
                        this.isMounted = false;
                    }

                    if (error instanceof Error) {
                        stripeupe.onError?.(error);
                    }

                    return;
                }

                if (!this.isMounted) {
                    await stripeElements?.fetchUpdates();
                    this.mountElement(paymentElement, stripeupe.containerId);
                }
            },
            (state) => state.getCheckout()?.outstandingBalance,
            (state) => state.getCheckout()?.coupons,
        );
    }

    mountElement(stripeElement: StripeElement, containerId: string): void {
        if (!document.getElementById(containerId)) {
            return;
        }

        stripeElement.mount(`#${containerId}`);
        this.isMounted = true;
    }

    mapAppearanceVariables(styles: NonNullable<StripeUPEPaymentInitializeOptions['style']>) {
        return {
            colorPrimary: styles.fieldInnerShadow,
            colorBackground: styles.fieldBackground,
            colorText: styles.labelText,
            colorDanger: styles.fieldErrorText,
            colorTextSecondary: styles.labelText,
            colorTextPlaceholder: styles.fieldPlaceholderText,
            colorIcon: styles.fieldPlaceholderText,
        };
    }

    mapInputAppearanceRules(styles: NonNullable<StripeUPEPaymentInitializeOptions['style']>) {
        return {
            borderColor: styles.fieldBorder,
            color: styles.fieldText,
            boxShadow: styles.fieldInnerShadow,
        };
    }

    throwStripeError(stripeError?: unknown): never {
        if (isStripeError(stripeError)) {
            this.throwDisplayableStripeError(stripeError);

            if (this.isCancellationError(stripeError)) {
                throw new PaymentMethodCancelledError();
            }
        }

        throw new PaymentMethodFailedError();
    }

    throwDisplayableStripeError(stripeError: StripeError) {
        if (
            includes(['card_error', 'invalid_request_error', 'validation_error'], stripeError.type)
        ) {
            throw new Error(stripeError.message);
        }
    }

    isCancellationError(stripeError?: StripeError): boolean {
        const errorMessage = stripeError?.payment_intent.last_payment_error?.message;

        return !!errorMessage && errorMessage.indexOf('canceled') !== -1;
    }

    throwPaymentConfirmationProceedMessage() {
        // INFO: for case if payment was successfully confirmed on Stripe side but on BC side something go wrong, request failed and order status hasn't changed yet
        // For shopper we need to show additional message that BC is waiting for stripe confirmation, to prevent additional payment creation
        throw new PaymentMethodFailedError(
            "We've received your order and are processing your payment. Once the payment is verified, your order will be completed. We will send you an email when it's completed. Please note, this process may take a few minutes depending on the processing times of your chosen method.",
        );
    }

    async isPaymentCompleted(
        methodId: string,
        stripeUPEClient?: StripeUPEClient,
    ): Promise<boolean> {
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const { features } = state.getStoreConfigOrThrow().checkoutSettings;

        if (
            !paymentMethod.clientToken ||
            !stripeUPEClient ||
            !features['PI-626.Block_unnecessary_payment_confirmation_for_StripeUPE']
        ) {
            return false;
        }

        const { paymentIntent } = await stripeUPEClient.retrievePaymentIntent(
            paymentMethod.clientToken,
        );

        return paymentIntent?.status === StripeUPEPaymentIntentStatus.SUCCEEDED;
    }

    mapStripePaymentData(
        stripeElements?: StripeElements,
        returnUrl?: string,
    ): StripeConfirmPaymentData {
        const billingAddress = this.paymentIntegrationService.getState().getBillingAddress();
        const { firstName, lastName, email } = billingAddress || {};
        const address = this._mapStripeAddress(billingAddress);

        if (!stripeElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!email || !address || !address.city || !address.country || !firstName || !lastName) {
            throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
        }

        return {
            elements: stripeElements,
            redirect: StripeStringConstants.IF_REQUIRED,
            confirmParams: {
                payment_method_data: {
                    billing_details: {
                        email,
                        address,
                        name: `${firstName} ${lastName}`,
                    },
                },
                ...(returnUrl && { return_url: returnUrl }),
            },
        };
    }

    isAdditionalActionError(errors: Array<{ code: string }>): boolean {
        return some(errors, { code: 'additional_action_required' });
    }

    isRedirectAction(additionalAction: StripeAdditionalActionRequired): boolean {
        const {
            type,
            data: { redirect_url },
        } = additionalAction;

        return type === 'redirect_to_url' && !!redirect_url;
    }

    isOnPageAdditionalAction(additionalAction: StripeAdditionalActionRequired): boolean {
        const {
            type,
            data: { token },
        } = additionalAction;

        return type === 'additional_action_requires_payment_method' && !!token;
    }

    async updateStripePaymentIntent(gatewayId: string, methodId: string): Promise<void> {
        // INFO: to trigger payment intent update on the BE side we need to make stripe config request
        const state = await this.paymentIntegrationService.loadPaymentMethod(gatewayId, {
            params: { method: methodId },
        });
        const { clientToken } = state.getPaymentMethodOrThrow(methodId);

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.scriptLoader.updateStripeElements({ clientSecret: clientToken });
    }

    private _mapStripeAddress(address?: Address): AddressOptions {
        if (address) {
            const { city, address1, address2, countryCode: country, postalCode } = address;

            return {
                city,
                country,
                postal_code: postalCode,
                line1: address1,
                line2: address2,
            };
        }

        throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
    }
}
