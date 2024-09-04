import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { PaymentStrategyActionType } from './payment-strategy-actions';
import PaymentStrategyWidgetActionCreator from './payment-strategy-widget-action-creator';

describe('PaymentStrategyWidgetActionCreator', () => {
    let actionCreator: PaymentStrategyWidgetActionCreator;

    beforeEach(() => {
        actionCreator = new PaymentStrategyWidgetActionCreator();
    });

    describe('#widgetInteraction()', () => {
        it('executes widget interaction callback', async () => {
            const options = { methodId: 'default' };
            const fakeMethod = jest.fn(() => Promise.resolve());

            await from(actionCreator.widgetInteraction(fakeMethod, options))
                .pipe(toArray())
                .toPromise();

            expect(fakeMethod).toHaveBeenCalled();
        });

        it('emits action to notify widget interaction in progress', async () => {
            const actions = await from(
                actionCreator.widgetInteraction(
                    jest.fn(() => Promise.resolve()),
                    { methodId: 'default' },
                ),
            )
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                {
                    type: PaymentStrategyActionType.WidgetInteractionStarted,
                    meta: { methodId: 'default' },
                },
                {
                    type: PaymentStrategyActionType.WidgetInteractionFinished,
                    meta: { methodId: 'default' },
                },
            ]);
        });

        it('emits error action if widget interaction fails', async () => {
            const signInError = new Error();
            const errorHandler = jest.fn((action) => of(action));

            const actions = await from(
                actionCreator.widgetInteraction(
                    jest.fn(() => Promise.reject(signInError)),
                    { methodId: 'default' },
                ),
            )
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                {
                    type: PaymentStrategyActionType.WidgetInteractionStarted,
                    meta: { methodId: 'default' },
                },
                {
                    type: PaymentStrategyActionType.WidgetInteractionFailed,
                    error: true,
                    payload: signInError,
                    meta: { methodId: 'default' },
                },
            ]);
        });
    });
});
