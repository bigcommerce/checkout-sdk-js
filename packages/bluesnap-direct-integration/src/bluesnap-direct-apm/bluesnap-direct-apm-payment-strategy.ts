import {
    isHostedInstrumentLike,
    isVaultedInstrument,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BlueSnapDirectRedirectResponse } from '../types';
import {
    isEcpInstrument,
    isIdealInstrument,
    isSepaInstrument,
} from '../utils/is-bluesnap-direct-instrument';
import isBlueSnapDirectRedirectResponseProviderData from '../utils/is-bluesnap-direct-provider-data';

export default class BlueSnapDirectAPMPaymentStrategy implements PaymentStrategy {
    constructor(private _paymentIntegrationService: PaymentIntegrationService) {}

    async execute(payload: OrderRequestBody): Promise<void> {
        const paymentPayload = this._formatePaymentPayload(payload);

        await this._paymentIntegrationService.submitOrder();

        try {
            await this._paymentIntegrationService.submitPayment(paymentPayload);
        } catch (error) {
            if (this._isBlueSnapDirectRedirectResponse(error)) {
                const providerData: unknown =
                    error.body.provider_data && JSON.parse(error.body.provider_data);

                let frameUrl = error.body.additional_action_required.data.redirect_url;

                if (isBlueSnapDirectRedirectResponseProviderData(providerData)) {
                    const providerDataQuery = new URLSearchParams(providerData).toString();

                    frameUrl = `${frameUrl}&${providerDataQuery}`;
                }

                return new Promise(() => window.location.replace(frameUrl));
            }

            return Promise.reject(error);
        }
    }

    initialize(): Promise<void> {
        return Promise.resolve();
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _formatePaymentPayload({ payment }: OrderRequestBody) {
        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (
            payment.paymentData &&
            isVaultedInstrument(payment.paymentData) &&
            isHostedInstrumentLike(payment.paymentData)
        ) {
            return {
                ...payment,
                paymentData: {
                    instrumentId: payment.paymentData.instrumentId,
                    shouldSetAsDefaultInstrument:
                        !!payment.paymentData.shouldSetAsDefaultInstrument,
                },
            };
        }

        if (isEcpInstrument(payment.paymentData)) {
            return {
                ...payment,
                paymentData: {
                    formattedPayload: {
                        ecp: {
                            account_number: payment.paymentData.accountNumber,
                            account_type: payment.paymentData.accountType,
                            shopper_permission: payment.paymentData.shopperPermission,
                            routing_number: payment.paymentData.routingNumber,
                        },
                        vault_payment_instrument: payment.paymentData.shouldSaveInstrument,
                        set_as_default_stored_instrument:
                            payment.paymentData.shouldSetAsDefaultInstrument,
                    },
                },
            };
        }

        if (isSepaInstrument(payment.paymentData)) {
            return {
                ...payment,
                paymentData: {
                    formattedPayload: {
                        sepa_direct_debit: {
                            iban: payment.paymentData.iban,
                            first_name: payment.paymentData.firstName,
                            last_name: payment.paymentData.lastName,
                            shopper_permission: payment.paymentData.shopperPermission,
                        },
                    },
                },
            };
        }

        if (isIdealInstrument(payment.paymentData)) {
            return {
                ...payment,
                paymentData: {
                    formattedPayload: {
                        ideal: {
                            bic: payment.paymentData.bic,
                        },
                    },
                },
            };
        }

        return {
            methodId: payment.methodId,
        };
    }

    private _isBlueSnapDirectRedirectResponse(
        response: unknown,
    ): response is BlueSnapDirectRedirectResponse {
        if (typeof response !== 'object' || response === null) {
            return false;
        }

        const partialResponse: Partial<BlueSnapDirectRedirectResponse> = response;

        if (!partialResponse.body) {
            return false;
        }

        const partialBody: Partial<BlueSnapDirectRedirectResponse['body']> = partialResponse.body;

        return (
            partialBody.status === 'additional_action_required' &&
            !!partialBody.additional_action_required?.data.redirect_url
        );
    }
}
