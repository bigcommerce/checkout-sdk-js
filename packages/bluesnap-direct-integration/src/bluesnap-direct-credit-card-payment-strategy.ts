import { WithCreditCardPaymentInitializeOptions } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    guard,
    InvalidArgumentError,
    isHostedInstrumentLike,
    MissingDataError,
    MissingDataErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BlueSnapDirectHostedForm from './bluesnap-direct-hosted-form';
import isHostedCardFieldOptionsMap from './is-hosted-card-field-options-map';
import { BlueSnapDirectThreeDSecureData } from './types';

export default class BlueSnapDirectCreditCardPaymentStrategy implements PaymentStrategy {
    private _paymentFieldsToken?: string;

    constructor(
        private _paymentIntegrationService: PaymentIntegrationService,
        private _blueSnapDirectHostedForm: BlueSnapDirectHostedForm,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithCreditCardPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId, gatewayId, creditCard } = options;

        if (!gatewayId || !creditCard || !isHostedCardFieldOptionsMap(creditCard.form.fields)) {
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

        await this._blueSnapDirectHostedForm.initialize(testMode);
        await this._blueSnapDirectHostedForm.attach(
            this._getPaymentFieldsToken(),
            creditCard,
            is3dsEnabled,
        );
    }

    async execute(payload: OrderRequestBody): Promise<void> {
        if (!payload.payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const pfToken = this._getPaymentFieldsToken();

        const { is3dsEnabled } = this._paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow(payload.payment.methodId, payload.payment.gatewayId).config;

        const { cardHolderName } = await this._blueSnapDirectHostedForm
            .validate()
            .submit(is3dsEnabled ? this._getBlueSnapDirectThreeDSecureData() : undefined);

        const { shouldSaveInstrument, shouldSetAsDefaultInstrument } = isHostedInstrumentLike(
            payload.payment.paymentData,
        )
            ? payload.payment.paymentData
            : { shouldSaveInstrument: false, shouldSetAsDefaultInstrument: false };

        await this._paymentIntegrationService.submitOrder();
        await this._paymentIntegrationService.submitPayment({
            ...payload.payment,
            paymentData: {
                formattedPayload: {
                    credit_card_token: {
                        token: JSON.stringify({
                            pfToken,
                            cardHolderName,
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
        this._blueSnapDirectHostedForm.detach();

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
