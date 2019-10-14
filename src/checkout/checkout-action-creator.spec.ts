import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { concat, from, of, throwError } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { MissingDataError, StandardError } from '../common/error/errors';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { ConfigActionCreator, ConfigActionType, ConfigRequestSender } from '../config';
import { getConfig } from '../config/configs.mock';

import CheckoutActionCreator from './checkout-action-creator';
import { CheckoutActionType } from './checkout-actions';
import CheckoutRequestSender from './checkout-request-sender';
import CheckoutStore from './checkout-store';
import { getCheckout, getCheckoutStoreState } from './checkouts.mock';
import createCheckoutStore from './create-checkout-store';

describe('CheckoutActionCreator', () => {
    let actionCreator: CheckoutActionCreator;
    let checkoutRequestSender: CheckoutRequestSender;
    let configRequestSender: ConfigRequestSender;
    let configActionCreator: ConfigActionCreator;
    let store: CheckoutStore;

    beforeEach(() => {
        const requestSender = createRequestSender();
        checkoutRequestSender = new CheckoutRequestSender(requestSender);
        configRequestSender = new ConfigRequestSender(requestSender);
        store = createCheckoutStore(getCheckoutStoreState());

        jest.spyOn(configRequestSender, 'loadConfig')
            .mockReturnValue(Promise.resolve(getResponse(getConfig())));

        jest.spyOn(checkoutRequestSender, 'loadCheckout')
            .mockReturnValue(Promise.resolve(getResponse(getCheckout())));

        jest.spyOn(checkoutRequestSender, 'updateCheckout')
            .mockReturnValue(Promise.resolve(getResponse(getCheckout())));

        configActionCreator = new ConfigActionCreator(configRequestSender);

        jest.spyOn(configActionCreator, 'loadConfig');

        actionCreator = new CheckoutActionCreator(checkoutRequestSender, configActionCreator);
    });

    describe('#loadCheckout', () => {
        it('emits action to notify loading progress', async () => {
            const { id } = getCheckout();
            const actions = await actionCreator.loadCheckout(id)
                .pipe(toArray())
                .toPromise();

            expect(checkoutRequestSender.loadCheckout).toHaveBeenCalledWith(id, undefined);

            expect(actions).toEqual([
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: ConfigActionType.LoadConfigRequested },
                { type: ConfigActionType.LoadConfigSucceeded, payload: getConfig() },
                { type: CheckoutActionType.LoadCheckoutSucceeded, payload: getCheckout() },
            ]);
        });

        it('emits error action if unable to load checkout', async () => {
            jest.spyOn(checkoutRequestSender, 'loadCheckout')
                .mockReturnValue(Promise.reject(getErrorResponse()));

            const { id } = getCheckout();
            const errorHandler = jest.fn(action => of(action));

            const actions = await actionCreator.loadCheckout(id)
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: ConfigActionType.LoadConfigRequested },
                { type: ConfigActionType.LoadConfigSucceeded, payload: getConfig() },
                { type: CheckoutActionType.LoadCheckoutFailed, error: true, payload: getErrorResponse() },
            ]);
        });

        it('emits error action if unable to load config', async () => {
            const errorResponse = getErrorResponse();

            jest.spyOn(configActionCreator, 'loadConfig')
                .mockReturnValue(concat(
                    of(createAction(ConfigActionType.LoadConfigRequested)),
                    throwError(createErrorAction(ConfigActionType.LoadConfigFailed, errorResponse))
                ));

            const errorHandler = jest.fn(action => of(action));
            const actions = await actionCreator.loadCheckout('b20deef40f9699e48671bbc3fef6ca44dc80e3c7')
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: ConfigActionType.LoadConfigRequested },
                { type: ConfigActionType.LoadConfigFailed, error: true, payload: errorResponse },
                { type: CheckoutActionType.LoadCheckoutFailed, error: true, payload: errorResponse },
            ]);
        });

        it('calls loadConfig in parallel', () => {
            const { id } = getCheckout();

            jest.spyOn(configActionCreator, 'loadConfig')
                .mockReturnValue(new Promise(() => {}));

            actionCreator.loadCheckout(id)
                .toPromise();

            expect(configActionCreator.loadConfig).toHaveBeenCalled();
            expect(checkoutRequestSender.loadCheckout).toHaveBeenCalled();
        });
    });

    describe('#loadDefaultCheckout', () => {
        it('emits action to notify loading progress', async () => {
            const actions = await from(actionCreator.loadDefaultCheckout()(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: ConfigActionType.LoadConfigRequested },
                { type: ConfigActionType.LoadConfigSucceeded, payload: getConfig() },
                { type: CheckoutActionType.LoadCheckoutSucceeded, payload: getCheckout() },
            ]);

            expect(configActionCreator.loadConfig).toHaveBeenCalled();
            expect(checkoutRequestSender.loadCheckout).toHaveBeenCalled();
        });

        it('emits error action if unable to load checkout', async () => {
            jest.spyOn(checkoutRequestSender, 'loadCheckout')
                .mockReturnValue(Promise.reject(getErrorResponse()));

            const errorHandler = jest.fn(action => of(action));

            const actions = await from(actionCreator.loadDefaultCheckout()(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CheckoutActionType.LoadCheckoutRequested },
                { type: ConfigActionType.LoadConfigRequested },
                { type: ConfigActionType.LoadConfigSucceeded, payload: getConfig() },
                { type: CheckoutActionType.LoadCheckoutFailed, error: true, payload: getErrorResponse() },
            ]);
        });

        it('does not call loadCheckout until loadConfig resolves', () => {
            jest.spyOn(configActionCreator, 'loadConfig')
                .mockReturnValue(new Promise(() => {}));

            from(actionCreator.loadDefaultCheckout()(store)).toPromise();

            expect(configActionCreator.loadConfig).toHaveBeenCalled();
            expect(checkoutRequestSender.loadCheckout).not.toHaveBeenCalled();
        });

        it('calls loadCheckout after loadConfig with the default checkout ID', async () => {
            await from(actionCreator.loadDefaultCheckout()(store)).toPromise();

            expect(configActionCreator.loadConfig).toHaveBeenCalled();
            expect(checkoutRequestSender.loadCheckout).toHaveBeenCalledWith(
                '6a6071cc-82ba-45aa-adb0-ebec42d6ff6f', undefined
            );
        });
    });

    describe('#updateCheckout', () => {
        it('calls checkout request sender', async () => {
            await from(actionCreator.updateCheckout({ customerMessage: 'foo' })(store))
                .pipe(toArray())
                .toPromise();

            expect(checkoutRequestSender.updateCheckout)
                .toHaveBeenCalledWith(
                    'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                    { customerMessage: 'foo' },
                    undefined
                );
        });

        it('emits action to notify updating progress', async () => {
            const actions = await from(actionCreator.updateCheckout({ customerMessage: 'foo' })(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: CheckoutActionType.UpdateCheckoutRequested },
                { type: CheckoutActionType.UpdateCheckoutSucceeded, payload: getCheckout() },
            ]);
        });

        it('emits error action if unable to update checkout', async () => {
            jest.spyOn(checkoutRequestSender, 'updateCheckout')
                .mockReturnValue(Promise.reject(getErrorResponse()));

            const errorHandler = jest.fn(action => of(action));

            const actions = await from(actionCreator.updateCheckout({ customerMessage: 'foo' })(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: CheckoutActionType.UpdateCheckoutRequested },
                { type: CheckoutActionType.UpdateCheckoutFailed, error: true, payload: getErrorResponse() },
            ]);
        });
    });

    describe('#loadCurrentCheckout()', () => {
        it('loads checkout by using existing id', async () => {
            await from(actionCreator.loadCurrentCheckout()(store))
                .toPromise();

            expect(checkoutRequestSender.loadCheckout)
                .toHaveBeenCalledWith('b20deef40f9699e48671bbc3fef6ca44dc80e3c7', undefined);
        });

        it('throws error if there is no existing checkout id', async () => {
            store = createCheckoutStore();

            try {
                await from(actionCreator.loadCurrentCheckout()(store))
                    .toPromise();
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('loads checkout only when action is dispatched', async () => {
            const action = actionCreator.loadCurrentCheckout()(store);

            expect(checkoutRequestSender.loadCheckout).not.toHaveBeenCalled();

            await store.dispatch(action);

            expect(checkoutRequestSender.loadCheckout).toHaveBeenCalled();
        });
    });

    describe('#loadDefaultCheckout()', () => {
        it('loads checkout by using existing id', async () => {
            await from(actionCreator.loadDefaultCheckout()(store))
                .toPromise();

            expect(checkoutRequestSender.loadCheckout)
                .toHaveBeenCalledWith('6a6071cc-82ba-45aa-adb0-ebec42d6ff6f', undefined);
        });

        it('throws error if there is no existing checkout id', async () => {
            store = createCheckoutStore();

            try {
                await from(actionCreator.loadDefaultCheckout()(store))
                    .toPromise();
            } catch ({ payload }) {
                expect(payload).toBeInstanceOf(StandardError);
            }
        });

        it('loads checkout only when action is dispatched', async () => {
            const action = actionCreator.loadDefaultCheckout()(store);

            expect(checkoutRequestSender.loadCheckout).not.toHaveBeenCalled();

            await store.dispatch(action);

            expect(checkoutRequestSender.loadCheckout).toHaveBeenCalled();
        });
    });
});
