import { WithCreditCardPaymentInitializeOptions } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    guard,
    InvalidArgumentError,
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
            config: { testMode },
            clientToken,
        } = state.getPaymentMethodOrThrow(methodId, gatewayId);

        this._paymentFieldsToken = clientToken;

        await this._blueSnapDirectHostedForm.initialize(testMode);
        await this._blueSnapDirectHostedForm.attach(this._getPaymentFieldsToken(), creditCard);
    }

    async execute(payload: OrderRequestBody): Promise<void> {
        if (!payload.payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const pfToken = this._getPaymentFieldsToken();

        const { cardHolderName } = await this._blueSnapDirectHostedForm.validate().submit();

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

    private _getPaymentFieldsToken(): string {
        return guard(
            this._paymentFieldsToken,
            () => new MissingDataError(MissingDataErrorType.MissingPaymentToken),
        );
    }
}
