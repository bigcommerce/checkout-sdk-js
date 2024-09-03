import { createAction } from '@bigcommerce/data-store';
import { concat, defer, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { throwErrorAction } from '../common/error';

import { PaymentRequestOptions } from './payment-request-options';
import { PaymentStrategyActionType, PaymentStrategyWidgetAction } from './payment-strategy-actions';

export default class PaymentStrategyWidgetActionCreator {
    widgetInteraction(
        method: () => Promise<unknown>,
        options?: PaymentRequestOptions,
    ): Observable<PaymentStrategyWidgetAction> {
        const methodId = options && options.methodId;
        const meta = { methodId };

        return concat(
            of(createAction(PaymentStrategyActionType.WidgetInteractionStarted, undefined, meta)),
            defer(() =>
                method().then(() =>
                    createAction(
                        PaymentStrategyActionType.WidgetInteractionFinished,
                        undefined,
                        meta,
                    ),
                ),
            ),
        ).pipe(
            catchError((error) =>
                throwErrorAction(PaymentStrategyActionType.WidgetInteractionFailed, error, meta),
            ),
        );
    }
}
