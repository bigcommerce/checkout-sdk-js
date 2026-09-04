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
    StripeClient,
    StripeConfirmPaymentData,
    StripeElement,
    StripeElements,
    StripeError,
    StripeInitializationData,
    StripePaymentIntentStatus,
    StripeStringConstants,
} from './stripe';
import StripePaymentInitializeOptions from './stripe-initialize-options';
import StripeScriptLoader from './stripe-script-loader';

export default class StripeIntegrationService {
    private cachedCartVersion?: number;
    private cachedCheckoutVersion?: number;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private scriptLoader: StripeScriptLoader,
    ) {}

    mountElement(stripeElement: StripeElement, containerId: string): void {
        if (!document.getElementById(containerId)) {
            return;
        }

        stripeElement.mount(`#${containerId}`);
    }

    mapAppearanceVariables(styles: NonNullable<StripePaymentInitializeOptions['style']>) {
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

    mapInputAppearanceRules(styles: NonNullable<StripePaymentInitializeOptions['style']>) {
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

    async isPaymentCompleted(methodId: string, stripeUPEClient?: StripeClient): Promise<boolean> {
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

        return paymentIntent?.status === StripePaymentIntentStatus.SUCCEEDED;
    }

    async isPaymentCompletedByToken(
        token?: string,
        stripeUPEClient?: StripeClient,
    ): Promise<boolean> {
        const state = this.paymentIntegrationService.getState();
        const { features } = state.getStoreConfigOrThrow().checkoutSettings;

        if (
            !token ||
            !stripeUPEClient ||
            !features['PI-626.Block_unnecessary_payment_confirmation_for_StripeUPE']
        ) {
            return false;
        }

        const { paymentIntent } = await stripeUPEClient.retrievePaymentIntent(token);

        return paymentIntent?.status === StripePaymentIntentStatus.SUCCEEDED;
    }

    mapStripePaymentData(
        stripeElements?: StripeElements,
        returnUrl?: string,
        shouldAllowRedisplay = false,
    ): StripeConfirmPaymentData {
        const billingAddress = this.paymentIntegrationService.getState().getBillingAddress();
        const { firstName = '', lastName = '', email = '' } = billingAddress || {};
        const address = this.mapStripeAddress(billingAddress);

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
                    ...(shouldAllowRedisplay ? { allow_redisplay: 'always' } : {}),
                    billing_details: {
                        email,
                        address,
                        name: this.getShopperFullName(billingAddress),
                    },
                },
                ...(returnUrl && { return_url: returnUrl }),
            },
        };
    }

    isAdditionalActionError(errors: Array<{ code: string }>): boolean {
        return some(errors, { code: 'additional_action_required' });
    }

    isSessionExpiredError(errors: Array<{ code: string }>): boolean {
        return some(errors, { code: 'authorization_expired' });
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
            // INFO: no need to update Stripe Element if client token is not present
            return;
        }

        this.scriptLoader.updateStripeElements({ clientSecret: clientToken });
    }

    cacheCheckoutStateVersions(): void {
        const state = this.paymentIntegrationService.getState();

        this.cachedCartVersion = state.getCart()?.version;
        this.cachedCheckoutVersion = state.getCheckout()?.version;
    }

    clearCheckoutStateVersions(): void {
        this.cachedCartVersion = undefined;
        this.cachedCheckoutVersion = undefined;
    }

    shouldSkipCheckoutStateUpdate(methodId: string, gatewayId: string): boolean {
        const state = this.paymentIntegrationService.getState();
        const { initializationData } = state.getPaymentMethodOrThrow<StripeInitializationData>(
            methodId,
            gatewayId,
        );
        const { skipUnchangedCheckoutSessionUpdate } = initializationData || {};

        if (!skipUnchangedCheckoutSessionUpdate) {
            return false;
        }

        return (
            this.cachedCartVersion === state.getCart()?.version &&
            this.cachedCheckoutVersion === state.getCheckout()?.version
        );
    }

    async applyStoreCreditIfNeeded(useStoreCredit?: boolean): Promise<void> {
        const { isStoreCreditApplied } = this.paymentIntegrationService
            .getState()
            .getCheckoutOrThrow();

        if (useStoreCredit !== undefined && useStoreCredit !== isStoreCreditApplied) {
            await this.paymentIntegrationService.applyStoreCredit(useStoreCredit);
        }
    }

    mapStripeAddress(address?: Address): AddressOptions {
        if (address) {
            const {
                city,
                address1,
                address2,
                countryCode: country,
                postalCode,
                stateOrProvinceCode,
            } = address;

            return {
                city,
                country,
                postal_code: postalCode,
                line1: address1,
                line2: address2,
                ...(stateOrProvinceCode ? { state: stateOrProvinceCode } : {}),
            };
        }

        throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
    }

    getShopperFullName(address?: Address): string {
        const { firstName = '', lastName = '' } = address || {};

        return `${firstName} ${lastName}`.trim();
    }

    async verifyCheckoutSpamProtection(): Promise<void> {
        const { shouldExecuteSpamCheck } = this.paymentIntegrationService
            .getState()
            .getCheckoutOrThrow();

        if (shouldExecuteSpamCheck) {
            await this.paymentIntegrationService.verifyCheckoutSpamProtection();
        }
    }
}
