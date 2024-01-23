import {
    InvalidArgumentError,
    isHostedInstrumentLike,
    isVaultedInstrument,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodInvalidError,
    PaymentStrategy,
    VaultedInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { SquareIntent } from './enums';
import { WithSquareV2PaymentInitializeOptions } from './squarev2-payment-initialize-options';
import SquareV2PaymentProcessor from './squarev2-payment-processor';
import {
    SquareFormattedVaultedInstrument,
    SquareInitializationData,
    SquarePaymentMethodInitializationData,
} from './types';

export default class SquareV2PaymentStrategy implements PaymentStrategy {
    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _squareV2PaymentProcessor: SquareV2PaymentProcessor,
    ) {}

    async initialize(
        options?: PaymentInitializeOptions & WithSquareV2PaymentInitializeOptions,
    ): Promise<void> {
        if (!options?.squarev2?.containerId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "containerId" argument is not provided.',
            );
        }

        const { methodId, squarev2 } = options;
        const {
            config: { testMode },
            initializationData,
        } = this._paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<SquarePaymentMethodInitializationData>(methodId);
        const { applicationId, locationId } = initializationData || {};

        if (!applicationId) {
            throw new PaymentMethodInvalidError();
        }

        await this._squareV2PaymentProcessor.initialize({
            applicationId,
            locationId,
            testMode,
        });
        await this._squareV2PaymentProcessor.initializeCard(squarev2);
    }

    async execute({ payment }: OrderRequestBody): Promise<void> {
        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId, paymentData } = payment;
        const { shouldSaveInstrument, shouldSetAsDefaultInstrument } = isHostedInstrumentLike(
            paymentData,
        )
            ? paymentData
            : { shouldSaveInstrument: false, shouldSetAsDefaultInstrument: false };

        await this._paymentIntegrationService.submitOrder();

        const submitPaymentPayload =
            paymentData && isVaultedInstrument(paymentData)
                ? await this._getVaultedInstrumentPayload(methodId, paymentData)
                : await this._getCardPayload(shouldSaveInstrument);

        await this._paymentIntegrationService.submitPayment({
            ...payment,
            paymentData: {
                formattedPayload: {
                    ...submitPaymentPayload,
                    vault_payment_instrument: shouldSaveInstrument || false,
                    set_as_default_stored_instrument: shouldSetAsDefaultInstrument || false,
                },
            },
        });
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        return this._squareV2PaymentProcessor.deinitialize();
    }

    private _shouldVerify(): boolean {
        const { features } = this._paymentIntegrationService
            .getState()
            .getStoreConfigOrThrow().checkoutSettings;

        return features['PROJECT-3828.add_3ds_support_on_squarev2'];
    }

    private async _getCardPayload(shouldSaveInstrument?: boolean) {
        const cardTokenizationResult = await this._squareV2PaymentProcessor.tokenize();

        if (!this._shouldVerify()) {
            return {
                credit_card_token: {
                    token: cardTokenizationResult,
                },
            };
        }

        const creditCardTokens = {
            nonce: cardTokenizationResult,
            token: await this._squareV2PaymentProcessor.verifyBuyer(
                cardTokenizationResult,
                SquareIntent.CHARGE,
            ),
        };
        let savingCreditCardTokens;

        if (shouldSaveInstrument) {
            // INFO: additional 'tokenize' is required to verify and save the card
            // for each 'verifyBuyer' we need to generate new token
            const tokenForSavingCard = await this._squareV2PaymentProcessor.tokenize();

            savingCreditCardTokens = {
                store_card_nonce: tokenForSavingCard,
                store_card_token: await this._squareV2PaymentProcessor.verifyBuyer(
                    tokenForSavingCard,
                    SquareIntent.STORE,
                ),
            };
        }

        return {
            credit_card_token: {
                token: JSON.stringify({
                    ...creditCardTokens,
                    ...savingCreditCardTokens,
                }),
            },
        };
    }

    private async _getVaultedInstrumentPayload(
        methodId: string,
        paymentData: VaultedInstrument,
    ): Promise<SquareFormattedVaultedInstrument> {
        const { instrumentId } = paymentData;
        const verificationToken = this._shouldVerify()
            ? await this._squareV2PaymentProcessor.verifyBuyer(
                  await this._getSquareCardIdOrThrow(methodId, instrumentId),
                  SquareIntent.CHARGE,
              )
            : undefined;

        return {
            bigpay_token: {
                token: instrumentId,
                ...(verificationToken && { three_d_secure: { token: verificationToken } }),
            },
        };
    }

    private async _getSquareCardIdOrThrow(methodId: string, instrumentId: string): Promise<string> {
        const state = await this._paymentIntegrationService.loadPaymentMethod(methodId, {
            params: { method: methodId, bigpayToken: instrumentId },
        });

        const { initializationData } =
            state.getPaymentMethodOrThrow<SquareInitializationData>(methodId);
        const { cardId } = initializationData || {};

        if (!cardId) {
            throw new PaymentArgumentInvalidError(['cardId']);
        }

        return cardId;
    }
}
