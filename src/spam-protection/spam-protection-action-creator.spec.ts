import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { ScriptLoader } from '@bigcommerce/script-loader';
import { merge } from 'lodash';
import { from, of, ReplaySubject, Subject } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { createCheckoutStore, CheckoutStore, CheckoutStoreState } from '../checkout';
import { getCheckout, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { getResponse } from '../common/http-request/responses.mock';

import createSpamProtection from './create-spam-protection';
import { SpamProtectionChallengeNotCompletedError, SpamProtectionFailedError } from './errors';
import GoogleRecaptcha, { RecaptchaResult } from './google-recaptcha';
import SpamProtectionActionCreator from './spam-protection-action-creator';
import { SpamProtectionActionType } from './spam-protection-actions';
import { SpamProtectionOptions } from './spam-protection-options';
import SpamProtectionRequestSender from './spam-protection-request-sender';

describe('SpamProtectionActionCreator', () => {
    let spamProtectionActionCreator: SpamProtectionActionCreator;
    let spamProtectionRequestSender: SpamProtectionRequestSender;
    let googleRecaptcha: GoogleRecaptcha;
    let response: Response;
    let state: CheckoutStoreState;
    let store: CheckoutStore;
    let $event: Subject<RecaptchaResult>;

    beforeEach(() => {
        state = getCheckoutStoreState();
        store = createCheckoutStore(state);
        googleRecaptcha = createSpamProtection(new ScriptLoader());
        response = getResponse(getCheckout());
        spamProtectionRequestSender = new SpamProtectionRequestSender(createRequestSender());
        spamProtectionActionCreator = new SpamProtectionActionCreator(
            googleRecaptcha,
            spamProtectionRequestSender
        );
        jest.spyOn(googleRecaptcha, 'load').mockReturnValue(Promise.resolve());
        $event = new ReplaySubject<RecaptchaResult>();
        jest.spyOn(googleRecaptcha, 'execute').mockReturnValue($event);
        jest.spyOn(spamProtectionRequestSender, 'validate').mockReturnValue(Promise.resolve(response));
    });

    describe('#initialize()', () => {
        let options: SpamProtectionOptions;

        beforeEach(() => {
            options = {
                containerId: 'spamProtection',
            };
        });

        it('emits actions if able to initialize spam protection', async () => {
            const actions = await from(spamProtectionActionCreator.initialize(options)(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: SpamProtectionActionType.InitializeRequested },
                { type: SpamProtectionActionType.InitializeSucceeded },
            ]);
        });

        it('emits actions if able to initialize spam protection without options', async () => {
            const actions = await from(spamProtectionActionCreator.initialize()(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: SpamProtectionActionType.InitializeRequested },
                { type: SpamProtectionActionType.InitializeSucceeded },
            ]);
        });

        it('emits error actions if unable to initialize spam protection', async () => {
            jest.spyOn(googleRecaptcha, 'load').mockReturnValue(Promise.reject());

            const errorHandler = jest.fn(action => of(action));

            const actions = await from(spamProtectionActionCreator.initialize(options)(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();

            expect(actions).toEqual([
                { type: SpamProtectionActionType.InitializeRequested },
                {
                    type: SpamProtectionActionType.InitializeFailed,
                    error: true,
                },
            ]);
        });
    });

    describe('#execute()', () => {
        it('emits actions if able to execute spam check', async () => {
            const store = createCheckoutStore(merge({}, getCheckoutStoreState(), {
                checkout: {
                    data: {
                        shouldExecuteSpamCheck: true,
                    },
                },
            }));

            $event.next({ token: 'spamProtectionToken' });

            const actions = await from(spamProtectionActionCreator.execute()(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: SpamProtectionActionType.ExecuteRequested },
                { type: SpamProtectionActionType.InitializeRequested },
                { type: SpamProtectionActionType.InitializeSucceeded },
                { type: SpamProtectionActionType.ExecuteSucceeded, payload: response.body },
            ]);
        });

        it('emits error actions if unable to execute spam protection due to cancellation', async () => {
            const store = createCheckoutStore(merge({}, getCheckoutStoreState(), {
                checkout: {
                    data: {
                        shouldExecuteSpamCheck: true,
                    },
                },
            }));
            const error = new SpamProtectionChallengeNotCompletedError();

            $event.next({ error });

            const errorHandler = jest.fn(action => of(action));
            const actions = await from(spamProtectionActionCreator.execute()(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: SpamProtectionActionType.ExecuteRequested },
                { type: SpamProtectionActionType.InitializeRequested },
                { type: SpamProtectionActionType.InitializeSucceeded },
                {
                    type: SpamProtectionActionType.ExecuteFailed,
                    payload: error,
                    error: true,
                },
            ]);
        });

        it('emits error actions if unable to execute spam protection due to unknown error', async () => {
            const store = createCheckoutStore(merge({}, getCheckoutStoreState(), {
                checkout: {
                    data: {
                        shouldExecuteSpamCheck: true,
                    },
                },
            }));

            $event.next({ error: new Error() });

            const errorHandler = jest.fn(action => of(action));
            const actions = await from(spamProtectionActionCreator.execute()(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: SpamProtectionActionType.ExecuteRequested },
                { type: SpamProtectionActionType.InitializeRequested },
                { type: SpamProtectionActionType.InitializeSucceeded },
                {
                    type: SpamProtectionActionType.ExecuteFailed,
                    payload: expect.any(SpamProtectionFailedError),
                    error: true,
                },
            ]);
        });

        it('does not emit actions if spam check should not be run', async () => {
            const actions = await from(spamProtectionActionCreator.execute()(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([]);
        });
    });
});
