import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, from, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { OrderActionCreator } from '../order';

import Payment from './payment';
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
            from(this._paymentRequestSender.submitPayment(
                this._paymentRequestTransformer.transform(payment, store.getState())
            ))
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
        gatewayId?: string
    ): ThunkAction<InitializeOffsitePaymentAction, InternalCheckoutSelectors> {
        return store => {
            const payload = this._paymentRequestTransformer.transform({ gatewayId, methodId }, store.getState());

            return concat(
                of(createAction(PaymentActionType.InitializeOffsitePaymentRequested)),
                this._paymentRequestSender.initializeOffsitePayment(payload)
                    .then(() => createAction(PaymentActionType.InitializeOffsitePaymentSucceeded))
            ).pipe(
                catchError(error => throwErrorAction(PaymentActionType.InitializeOffsitePaymentFailed, error))
            );
        };
    }
}
