import {
    AnalyticsExtraItemsManager,
    isAnalyticsTrackerWindow,
} from '@bigcommerce/checkout-sdk/analytics';
import {
    InvalidArgumentError,
    isWithAccountCreation,
    MissingDataError,
    MissingDataErrorType,
    NonceInstrument,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodCancelledError,
    PaymentMethodFailedError,
    PaymentMethodInvalidError,
    PaymentRequestOptions,
    PaymentStrategy,
    WithAccountCreation,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BoltCheckout,
    BoltEmbedded,
    BoltEmbeddedTokenize,
    BoltEmbededField,
    BoltPaymentMethod,
    BoltTransaction,
} from './bolt';
import BoltError from './bolt-error';
import { WithBoltPaymentInitializeOptions } from './bolt-payment-initialize-options';
import BoltScriptLoader from './bolt-script-loader';
import { isBoltPaymentData } from './is-bolt-payment-data';

export default class BoltPaymentStrategy implements PaymentStrategy {
    private boltClient?: BoltCheckout;
    private boltEmbedded?: BoltEmbedded;
    private embeddedField?: BoltEmbededField;
    private useBoltClient = false;
    private useBoltEmbedded = false;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private boltScriptLoader: BoltScriptLoader,
        private analyticsExtraItemsManager: AnalyticsExtraItemsManager,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithBoltPaymentInitializeOptions,
    ): Promise<void> {
        const { bolt, methodId } = options;
        const { containerId, onPaymentSelect, useBigCommerceCheckout } = bolt || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!useBigCommerceCheckout) {
            // info: calling loadBoltClient method without providing any params is necessary for Bolt Full Checkout and Fraud Protection
            this.boltClient = await this.boltScriptLoader.loadBoltClient();

            return;
        }

        const paymentMethod: BoltPaymentMethod = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow(options.methodId);

        const { initializationData, config } = paymentMethod;
        const { publishableKey, developerConfig, embeddedOneClickEnabled } =
            initializationData || {};
        const { testMode } = config;

        if (!publishableKey) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this.boltClient = await this.boltScriptLoader.loadBoltClient(
            publishableKey,
            testMode,
            developerConfig,
        );

        this.useBoltClient = !embeddedOneClickEnabled;
        this.useBoltEmbedded = !!embeddedOneClickEnabled;

        if (this.useBoltEmbedded) {
            if (!containerId) {
                throw new InvalidArgumentError(
                    'Unable to initialize payment because "options.bolt.containerId" argument is not provided.',
                );
            }

            if (!onPaymentSelect) {
                throw new InvalidArgumentError(
                    'Unable to initialize payment because "options.bolt.onPaymentSelect" argument is not provided.',
                );
            }

            this.boltEmbedded = await this.boltScriptLoader.loadBoltEmbedded(
                publishableKey,
                testMode,
                developerConfig,
            );

            this.mountBoltEmbeddedField(containerId);
            onPaymentSelect(await this.hasBoltAccount());
        }
    }

    deinitialize(): Promise<void> {
        this.embeddedField?.unmount();

        this.boltClient = undefined;
        this.boltEmbedded = undefined;

        return Promise.resolve();
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        this.setExtraItemsForAnalytics();

        const { payment, ...order } = payload;
        const { methodId, paymentData } = payment || {};
        let paymentPayload;

        if (!payload.payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (!methodId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!paymentData || !isBoltPaymentData(paymentData)) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        await this.paymentIntegrationService.submitOrder(order, options);

        if (this.useBoltClient) {
            paymentPayload = await this.getBoltClientPaymentPayload(methodId, paymentData, options);
        } else if (this.useBoltEmbedded) {
            paymentPayload = await this.getBoltEmbeddedPaymentPayload(methodId, paymentData);
        } else {
            paymentPayload = await this.getBoltFullCheckoutPaymentPayload(methodId, paymentData);
        }

        await this.paymentIntegrationService.submitPayment(paymentPayload);
    }

    private async getBoltClientPaymentPayload(
        methodId: string,
        paymentData: NonceInstrument,
        options?: PaymentRequestOptions,
    ): Promise<Payment> {
        await this.paymentIntegrationService.loadPaymentMethod(methodId, options);

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);
        const orderToken = paymentMethod.clientToken;
        const { isStoreCreditApplied } = state.getCheckoutOrThrow();
        const { shouldSaveInstrument } = paymentData;
        const boltClient = this.getBoltClientOrThrow();

        await this.paymentIntegrationService.applyStoreCredit(isStoreCreditApplied);

        if (!orderToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const boltTransaction: BoltTransaction = await new Promise((resolve, reject) => {
            const onSuccess = (transaction: BoltTransaction, callback: () => void) => {
                if (!transaction.reference) {
                    reject(
                        new PaymentMethodFailedError(
                            'Unable to proceed because transaction reference is unavailable. Please try again later.',
                        ),
                    );
                } else {
                    resolve(transaction);
                }

                callback();
            };

            const onClose = () => {
                reject(new PaymentMethodCancelledError());
            };

            const callbacks = {
                success: onSuccess,
                close: onClose,
            };

            boltClient.configure({ orderToken }, {}, callbacks).open();
        });

        return {
            methodId,
            paymentData: {
                nonce: boltTransaction.reference,
                shouldSaveInstrument,
            },
        };
    }

    private async getBoltEmbeddedPaymentPayload(
        methodId: string,
        paymentData: WithAccountCreation,
    ): Promise<Payment> {
        if (!isWithAccountCreation(paymentData)) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        const tokenizeResult = this.validateTokenizeResultOrThrow(
            await this.embeddedField?.tokenize(),
        );

        return {
            methodId,
            paymentData: {
                formattedPayload: {
                    credit_card_token: {
                        token: tokenizeResult.token,
                        last_four_digits: tokenizeResult.last4,
                        iin: tokenizeResult.bin,
                        expiration_month: +tokenizeResult.expiration.split('-')[1],
                        expiration_year: +tokenizeResult.expiration.split('-')[0],
                    },
                    provider_data: {
                        create_account: !!paymentData.shouldCreateAccount,
                        embedded_checkout: true,
                    },
                },
            },
        };
    }

    private async getBoltFullCheckoutPaymentPayload(
        methodId: string,
        paymentData: NonceInstrument,
    ): Promise<Payment> {
        await this.setBoltOrderId();

        const boltClient = this.getBoltClientOrThrow();
        const transactionReference = await boltClient.getTransactionReference();

        if (!transactionReference) {
            throw new PaymentMethodInvalidError();
        }

        return {
            methodId,
            paymentData: {
                ...paymentData,
                nonce: transactionReference,
            },
        };
    }

    private getBoltClientOrThrow(): BoltCheckout {
        if (!this.boltClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.boltClient;
    }

    private getBoltEmbeddedOrThrow() {
        if (!this.boltEmbedded) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.boltEmbedded;
    }

    private async hasBoltAccount(): Promise<boolean> {
        const state = this.paymentIntegrationService.getState();
        const customer = state.getCustomer();
        const billingAddress = state.getBillingAddress();
        const email = customer?.email || billingAddress?.email || '';
        const boltClient = this.getBoltClientOrThrow();

        try {
            return await boltClient.hasBoltAccount(email);
        } catch {
            throw new PaymentMethodInvalidError();
        }
    }

    private async setBoltOrderId() {
        const order = this.paymentIntegrationService.getState().getOrderOrThrow();
        const boltClient = this.getBoltClientOrThrow();

        try {
            await boltClient.setOrderId(order.orderId);
        } catch {
            throw new PaymentMethodInvalidError();
        }
    }

    private mountBoltEmbeddedField(containerId: string) {
        const boltEmbedded = this.getBoltEmbeddedOrThrow();
        const styles = { backgroundColor: '#fff' };
        const embeddedField = boltEmbedded.create('payment_field', {
            styles,
            renderSeparateFields: true,
        });

        embeddedField.mount(`#${containerId}`);

        this.embeddedField = embeddedField;
    }

    private validateTokenizeResultOrThrow(
        tokenizeResult?: BoltEmbeddedTokenize | Error,
    ): BoltEmbeddedTokenize {
        if (!tokenizeResult) {
            throw new PaymentMethodInvalidError();
        }

        if (tokenizeResult instanceof Error) {
            throw new BoltError(tokenizeResult.message);
        }

        const { token, last4, bin, expiration } = tokenizeResult;
        const lastFourDigits = +last4;
        const iin = +bin;
        const expirationMonth = +`${expiration}`.split('-')[1];
        const expirationYear = +`${expiration}`.split('-')[0];

        if (
            !token ||
            Number.isNaN(lastFourDigits) ||
            Number.isNaN(iin) ||
            Number.isNaN(expirationMonth) ||
            Number.isNaN(expirationYear)
        ) {
            throw new PaymentArgumentInvalidError();
        }

        return tokenizeResult;
    }

    private setExtraItemsForAnalytics() {
        const state = this.paymentIntegrationService.getState();
        const storeConfig = state.getStoreConfigOrThrow();
        const cart = state.getCartOrThrow();

        if (storeConfig.checkoutSettings.isAnalyticsEnabled && isAnalyticsTrackerWindow(window)) {
            const { id, lineItems } = cart;

            this.analyticsExtraItemsManager.saveExtraItemsData(id, lineItems);
        }
    }
}
