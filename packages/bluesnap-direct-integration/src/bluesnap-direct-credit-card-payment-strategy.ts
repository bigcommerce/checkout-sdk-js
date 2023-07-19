import { WithCreditCardPaymentInitializeOptions } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    guard,
    InvalidArgumentError,
    isHostedInstrumentLike,
    isVaultedInstrument,
    MissingDataError,
    MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BlueSnapDirect3ds from './bluesnap-direct-3ds';
import BlueSnapDirectHostedForm from './bluesnap-direct-hosted-form';
import isHostedCardFieldOptionsMap from './is-hosted-card-field-options-map';
import isHostedStoredCardFieldOptionsMap from './is-hosted-stored-card-field-options-map';
import { BlueSnapDirectThreeDSecureData } from './types';

export default class BlueSnapDirectCreditCardPaymentStrategy implements PaymentStrategy {
    private _paymentFieldsToken?: string;
    private _shouldUseHostedFields?: boolean;

    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _blueSnapDirectHostedForm: BlueSnapDirectHostedForm,
        private _blueSnapDirect3ds: BlueSnapDirect3ds,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithCreditCardPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, gatewayId, creditCard } = options;

        if (!gatewayId || !creditCard) {
            throw new InvalidArgumentError();
        }

        const state = await this._paymentIntegrationService.loadPaymentMethod(gatewayId, {
            params: { method: methodId },
        });

        const {
            config: { testMode, is3dsEnabled },
            clientToken,
        } = state.getPaymentMethodOrThrow(methodId, gatewayId);

        this._paymentFieldsToken = clientToken;
        this._shouldUseHostedFields =
            isHostedCardFieldOptionsMap(creditCard.form.fields) ||
            (isHostedStoredCardFieldOptionsMap(creditCard.form.fields) &&
                !!creditCard.form.fields.cardNumberVerification);

        if (this._shouldUseHostedFields) {
            await this._blueSnapDirectHostedForm.initialize(testMode, creditCard.form.fields);
            await this._blueSnapDirectHostedForm.attach(
                this._getPaymentFieldsToken(),
                creditCard,
                is3dsEnabled,
            );
        }
    }

    async execute(payload: OrderRequestBody): Promise<void> {
        if (!payload.payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { paymentData } = payload.payment;

        const { shouldSaveInstrument, shouldSetAsDefaultInstrument } = isHostedInstrumentLike(
            paymentData,
        )
            ? paymentData
            : { shouldSaveInstrument: false, shouldSetAsDefaultInstrument: false };

        const pfToken = this._getPaymentFieldsToken();
        let threeDSecureReferenceId;

        const { is3dsEnabled } = this._paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow(payload.payment.methodId, payload.payment.gatewayId).config;

        const bluesnapSubmitedForm = this._shouldUseHostedFields
            ? await this._blueSnapDirectHostedForm
                  .validate()
                  .submit(
                      is3dsEnabled ? this._getBlueSnapDirectThreeDSecureData() : undefined,
                      !(isHostedInstrumentLike(paymentData) && isVaultedInstrument(paymentData)),
                  )
            : undefined;

        await this._paymentIntegrationService.submitOrder();

        if (
            isHostedInstrumentLike(paymentData) &&
            isVaultedInstrument(paymentData) &&
            this._paymentFieldsToken &&
            paymentData.instrumentId
        ) {
            if (is3dsEnabled && !this._shouldUseHostedFields) {
                await this._blueSnapDirect3ds.initialize();

                const { last4, brand } = this._paymentIntegrationService
                    .getState()
                    .getCardInstrumentOrThrow(paymentData.instrumentId);

                const previouslyUsedCard = {
                    last4Digits: last4,
                    ccType: brand.toUpperCase(),
                    ...this._getBlueSnapDirectThreeDSecureData(),
                };

                threeDSecureReferenceId = await this._blueSnapDirect3ds.initialize3ds(
                    this._paymentFieldsToken,
                    previouslyUsedCard,
                );
            }

            await this._paymentIntegrationService.submitPayment({
                ...payload.payment,
                paymentData: {
                    instrumentId: paymentData.instrumentId,
                    ...(this._shouldUseHostedFields ? { nonce: pfToken } : {}),
                    ...(threeDSecureReferenceId
                        ? { deviceSessionId: threeDSecureReferenceId }
                        : {}),
                    shouldSetAsDefaultInstrument: !!shouldSetAsDefaultInstrument,
                },
            });

            return;
        }

        await this._paymentIntegrationService.submitPayment({
            ...payload.payment,
            paymentData: {
                formattedPayload: {
                    credit_card_token: {
                        token: JSON.stringify({
                            pfToken,
                            cardHolderName:
                                bluesnapSubmitedForm && bluesnapSubmitedForm.cardHolderName,
                        }),
                    },
                    vault_payment_instrument: shouldSaveInstrument,
                    set_as_default_stored_instrument: shouldSetAsDefaultInstrument,
                },
            },
        });
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        if (this._shouldUseHostedFields) {
            this._blueSnapDirectHostedForm.detach();
        }

        return Promise.resolve();
    }

    private _getBlueSnapDirectThreeDSecureData(): BlueSnapDirectThreeDSecureData {
        const {
            getBillingAddress,
            getShippingAddress,
            getCustomer,
            getCheckoutOrThrow,
            getCartOrThrow,
        } = this._paymentIntegrationService.getState();
        const billingAddress = getBillingAddress();
        const shippingAddress = getShippingAddress();
        const email = getCustomer()?.email || billingAddress?.email;
        const phone = billingAddress?.phone || shippingAddress?.phone;

        return {
            amount: getCheckoutOrThrow().outstandingBalance,
            currency: getCartOrThrow().currency.code,
            ...(email && { email }),
            ...(phone && { phone }),
            ...(billingAddress && {
                billingFirstName: billingAddress.firstName,
                billingLastName: billingAddress.lastName,
                billingCountry: billingAddress.countryCode,
                billingState: billingAddress.stateOrProvinceCode,
                billingCity: billingAddress.city,
                billingAddress: `${billingAddress.address1} ${billingAddress.address2}`.trim(),
                billingZip: billingAddress.postalCode,
            }),
            ...(shippingAddress && {
                shippingFirstName: shippingAddress.firstName,
                shippingLastName: shippingAddress.lastName,
                shippingCountry: shippingAddress.countryCode,
                shippingState: shippingAddress.stateOrProvinceCode,
                shippingCity: shippingAddress.city,
                shippingAddress: `${shippingAddress.address1} ${shippingAddress.address2}`.trim(),
                shippingZip: shippingAddress.postalCode,
            }),
        };
    }

    private _getPaymentFieldsToken(): string {
        return guard(
            this._paymentFieldsToken,
            () => new MissingDataError(MissingDataErrorType.MissingPaymentToken),
        );
    }
}
