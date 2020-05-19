import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { OrderActionCreator } from '../order';
import { getVerificationAdditionalAction } from '../spam-protection';

import AdditionalAction from './additional-action';
import Payment, { FormattedHostedInstrument, FormattedPayload, FormattedVaultedInstrument } from './payment';
import { InitializeOffsitePaymentAction, PaymentActionType, SubmitPaymentAction } from './payment-actions';
import PaymentRequestSender from './payment-request-sender';
import PaymentRequestTransformer from './payment-request-transformer';

export default class PaymentActionCreator {
    constructor(
        private _paymentRequestSender: PaymentRequestSender,
        private _orderActionCreator: OrderActionCreator,
        private _paymentRequestTransformer: PaymentRequestTransformer
    ) {}

    submitPayment(payment: Payment): ThunkAction<SubmitPaymentAction, InternalCheckoutSelectors> {
        return store => concat(
            of(createAction(PaymentActionType.SubmitPaymentRequested)),
            defer(async () => {
                try {
                    return await this._paymentRequestSender.submitPayment(
                        this._paymentRequestTransformer.transform(payment, store.getState())
                    );
                } catch (error) {
                    const additionalAction: AdditionalAction = await getVerificationAdditionalAction(error);

                    return await this._paymentRequestSender.submitPayment(
                        this._paymentRequestTransformer.transform({ ...payment, additionalAction }, store.getState())
                    );
                }
            })
                .pipe(
                    switchMap(({ body }) => concat(
                        this._orderActionCreator.loadCurrentOrder()(store),
                        of(createAction(PaymentActionType.SubmitPaymentSucceeded, body))
                    ))
                )
        ).pipe(
            catchError(error => throwErrorAction(PaymentActionType.SubmitPaymentFailed, error))
        );
    }

    initializeOffsitePayment(
        methodId: string,
        gatewayId?: string,
        instrumentId?: string,
        shouldSaveInstrument?: boolean,
        target?: string,
        promise?: Promise<undefined>
    ): ThunkAction<InitializeOffsitePaymentAction, InternalCheckoutSelectors> {
        return store => {
            let paymentData: FormattedPayload<FormattedHostedInstrument | FormattedVaultedInstrument> | undefined;

            if (instrumentId) {
                paymentData = { formattedPayload: { bigpay_token: instrumentId } };
            } else if (shouldSaveInstrument) {
                paymentData = { formattedPayload: { vault_payment_instrument: shouldSaveInstrument } };
            }

            const payload = this._paymentRequestTransformer.transform({ gatewayId, methodId, paymentData }, store.getState());

            return concat(
                of(createAction(PaymentActionType.InitializeOffsitePaymentRequested)),
                Promise.race([this._paymentRequestSender.initializeOffsitePayment(payload, target), promise].filter(Boolean))
                    .then(() => createAction(PaymentActionType.InitializeOffsitePaymentSucceeded))
            ).pipe(
                catchError(error => throwErrorAction(PaymentActionType.InitializeOffsitePaymentFailed, error))
            );
        };
    }
}
