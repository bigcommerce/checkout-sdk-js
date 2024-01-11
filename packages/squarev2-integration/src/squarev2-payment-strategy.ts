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
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { SquareIntent } from './enums';
import { WithSquareV2PaymentInitializeOptions } from './squarev2-payment-initialize-options';
import SquareV2PaymentProcessor from './squarev2-payment-processor';
import { SquarePaymentMethodInitializationData } from './types';

export default class SquareV2PaymentStrategy implements PaymentStrategy {
    private _methodId?: string;

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

        this._methodId = methodId;

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

        const paymentData = payment.paymentData;

        const { shouldSaveInstrument, shouldSetAsDefaultInstrument } = isHostedInstrumentLike(
            paymentData,
        )
            ? paymentData
            : { shouldSaveInstrument: false, shouldSetAsDefaultInstrument: false };

        await this._paymentIntegrationService.submitOrder();

        if (paymentData && isVaultedInstrument(paymentData)) {
            if (this._shouldVerify()) {
                const squareCardId = this._getSquareCardId(paymentData.instrumentId);

                await this._paymentIntegrationService.submitPayment({
                    ...payment,
                    paymentData: {
                        formattedPayload: {
                            credit_card_token: {
                                token: JSON.stringify({
                                    card_id: squareCardId,
                                    token: await this._squareV2PaymentProcessor.verifyBuyer(
                                        squareCardId,
                                        SquareIntent.CHARGE,
                                    ),
                                }),
                            },
                            vault_payment_instrument: shouldSaveInstrument || false,
                            set_as_default_stored_instrument: shouldSetAsDefaultInstrument || false,
                        },
                    },
                });

                return;
            }

            await this._paymentIntegrationService.submitPayment({
                ...payment,
                paymentData: {
                    formattedPayload: {
                        bigpay_token: {
                            token: paymentData.instrumentId,
                        },
                        vault_payment_instrument: shouldSaveInstrument || false,
                        set_as_default_stored_instrument: shouldSetAsDefaultInstrument || false,
                    },
                },
            });

            return;
        }

        let nonce = await this._squareV2PaymentProcessor.tokenize();

        if (this._shouldVerify()) {
            if (shouldSaveInstrument) {
                const storeCardNonce = await this._squareV2PaymentProcessor.tokenize();

                nonce = JSON.stringify({
                    nonce,
                    store_card_nonce: storeCardNonce,
                    token: await this._squareV2PaymentProcessor.verifyBuyer(
                        nonce,
                        SquareIntent.CHARGE,
                    ),
                    store_card_token: await this._squareV2PaymentProcessor.verifyBuyer(
                        storeCardNonce,
                        SquareIntent.STORE,
                    ),
                });
            } else {
                nonce = JSON.stringify({
                    nonce,
                    token: await this._squareV2PaymentProcessor.verifyBuyer(
                        nonce,
                        SquareIntent.CHARGE,
                    ),
                });
            }
        }

        await this._paymentIntegrationService.submitPayment({
            ...payment,
            paymentData: {
                formattedPayload: {
                    credit_card_token: {
                        token: nonce,
                    },
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

    private _getSquareCardId(bigpayToken: string): string {
        if (this._methodId) {
            const { initializationData } = this._paymentIntegrationService
                .getState()
                .getPaymentMethodOrThrow<SquarePaymentMethodInitializationData>(this._methodId);

            const { squareCardsData } = initializationData || {};

            if (squareCardsData) {
                const cardData = squareCardsData.find((data) => data.bigpay_token === bigpayToken);

                return cardData?.provider_card_token || '';
            }
        }

        return '';
    }

    private _shouldVerify(): boolean {
        const { features } = this._paymentIntegrationService
            .getState()
            .getStoreConfigOrThrow().checkoutSettings;

        return features['PROJECT-3828.add_3ds_support_on_squarev2'];
    }
}
