import { noop } from 'rxjs';

import {
    CheckoutPaymentMethodExecutedOptions,
    CustomerCredentials,
    CustomerInitializeOptions,
    CustomerStrategy,
    ExecutePaymentMethodCheckoutOptions,
    InvalidArgumentError,
    isCustomError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodFailedError,
    PaymentMethodInvalidError,
    RequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BoltCheckout, BoltHostWindow, BoltInitializationData } from './bolt';
import { WithBoltCustomerInitializeOptions } from './bolt-customer-initialize-options';
import BoltScriptLoader from './bolt-script-loader';

export default class BoltCustomerStrategy implements CustomerStrategy {
    private boltHostWindow: BoltHostWindow = window;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private boltScriptLoader: BoltScriptLoader,
    ) {}

    async initialize(
        options: CustomerInitializeOptions & WithBoltCustomerInitializeOptions,
    ): Promise<void> {
        const { methodId, bolt } = options;
        const { onInit } = bolt || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        const paymentMethod: PaymentMethod<BoltInitializationData> = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<BoltInitializationData>(methodId);

        if (!paymentMethod.initializationData?.publishableKey) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { developerConfig, publishableKey } = paymentMethod.initializationData;

        await this.boltScriptLoader.loadBoltClient(
            publishableKey,
            paymentMethod.config.testMode,
            developerConfig,
        );

        if (onInit && typeof onInit === 'function') {
            const email = this.getCustomerEmail();
            const hasBoltAccount = await this.hasBoltAccount(email);

            onInit(hasBoltAccount, email);
        }
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    async signIn(credentials: CustomerCredentials, options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signInCustomer(credentials, options);

        return Promise.resolve();
    }

    async signOut(options?: RequestOptions): Promise<void> {
        await this.paymentIntegrationService.signOutCustomer(options);

        return Promise.resolve();
    }

    async executePaymentMethodCheckout(
        options?: ExecutePaymentMethodCheckoutOptions,
    ): Promise<void> {
        const {
            continueWithCheckoutCallback = noop,
            checkoutPaymentMethodExecuted,
            methodId,
        } = options || {};
        const email = this.getCustomerEmail();

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        if (typeof continueWithCheckoutCallback !== 'function') {
            throw new InvalidArgumentError(
                'Unable to proceed because "continueWithCheckoutCallback" argument is not provided and it must be a function.',
            );
        }

        if (!email) {
            continueWithCheckoutCallback();

            return;
        }

        return this.openBoltCheckoutModalOrThrow(
            email,
            methodId,
            continueWithCheckoutCallback,
            checkoutPaymentMethodExecuted,
        );
    }

    private async openBoltCheckoutModalOrThrow(
        email: string,
        methodId: string,
        continueWithCheckoutCallback: () => void,
        checkoutPaymentMethodExecuted?: (payload: CheckoutPaymentMethodExecutedOptions) => void,
    ): Promise<void> {
        const boltClient = this.getBoltClientOrThrow();
        const paymentMethod = this.paymentIntegrationService
            .getState()
            .getPaymentMethod<BoltInitializationData>(methodId);

        try {
            if (paymentMethod?.initializationData?.embeddedOneClickEnabled) {
                const hasBoltAccount = await this.hasBoltAccount(email);

                if (hasBoltAccount) {
                    const callbacks = {
                        close: () => {
                            continueWithCheckoutCallback();
                        },
                    };

                    await boltClient.openCheckout(email, callbacks);
                } else {
                    continueWithCheckoutCallback();
                }

                if (typeof checkoutPaymentMethodExecuted === 'function') {
                    checkoutPaymentMethodExecuted({ hasBoltAccount });
                }
            } else {
                continueWithCheckoutCallback();
            }
        } catch (error) {
            if (
                isCustomError(error) &&
                error.name !== 'MissingDataError' &&
                error.name !== 'NotInitializedError'
            ) {
                throw new PaymentMethodFailedError(error.message);
            }

            throw error;
        }
    }

    private getBoltClientOrThrow(): BoltCheckout {
        const boltClient = this.boltHostWindow.BoltCheckout;

        if (!boltClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return boltClient;
    }

    private async hasBoltAccount(email: string) {
        const boltClient = this.getBoltClientOrThrow();

        try {
            return await boltClient.hasBoltAccount(email);
        } catch {
            throw new PaymentMethodInvalidError();
        }
    }

    private getCustomerEmail() {
        const state = this.paymentIntegrationService.getState();
        const customer = state.getCustomer();
        const billingAddress = state.getBillingAddress();

        return customer?.email || billingAddress?.email || '';
    }
}
