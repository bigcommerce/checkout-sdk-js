import { ScriptLoader } from '@bigcommerce/script-loader';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { createCheckoutStore, CheckoutStore, CheckoutStoreState } from '../../checkout';
import { getCheckoutStoreState } from '../../checkout/checkouts.mock';

import createSpamProtection from './create-spam-protection';
import GoogleRecaptcha from './google-recaptcha';
import SpamProtectionActionCreator, { SpamProtectionCallbacks } from './spam-protection-action-creator';
import { SpamProtectionActionType } from './spam-protection-actions';
import { SpamProtectionOptions } from './spam-protection-options';

describe('SpamProtectionActionCreator', () => {
    let spamProtectionActionCreator: SpamProtectionActionCreator;
    let googleRecaptcha: GoogleRecaptcha;
    let state: CheckoutStoreState;
    let store: CheckoutStore;

    beforeEach(() => {
        state = getCheckoutStoreState();
        store = createCheckoutStore(state);
        googleRecaptcha = createSpamProtection(new ScriptLoader());

        spamProtectionActionCreator = new SpamProtectionActionCreator(googleRecaptcha);

        jest.spyOn(googleRecaptcha, 'render').mockImplementation(() => Promise.resolve());
    });

    describe('#initialize()', () => {
        let callbacks: SpamProtectionCallbacks;
        let options: SpamProtectionOptions;

        beforeEach(() => {
            callbacks = {
                onComplete: () => jest.fn(),
                onExpire: () => jest.fn(),
            };

            options = {
                containerId: 'spamProtection',
            };

            jest.spyOn(store, 'dispatch');
        });

        it('emits actions if able to initialize spam protection', async () => {
            const actions = await from(spamProtectionActionCreator.initialize(options, callbacks)(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: SpamProtectionActionType.InitializeRequested },
                { type: SpamProtectionActionType.InitializeSucceeded },
            ]);
        });

        it('emits error actions if unable to initialize spam protection', async () => {
            jest.spyOn(googleRecaptcha, 'render').mockReturnValue(Promise.reject());

            const errorHandler = jest.fn(action => of(action));

            const actions = await from(spamProtectionActionCreator.initialize(options, callbacks)(store))
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
                    meta: 'spamProtection',
                    error: true,
                },
            ]);
        });
    });

    describe('#complete()', () => {
        beforeEach(() => {
            jest.spyOn(store, 'dispatch');
        });

        it('emits actions if able to complete spam protection', () => {
            const token = 'spam-protection-token';

            expect(spamProtectionActionCreator.complete(token))
                .toEqual({
                    type: SpamProtectionActionType.Completed,
                    payload: token,
                });
        });
    });

    describe('#expire()', () => {
        beforeEach(() => {
            jest.spyOn(store, 'dispatch');
        });

        it('emits actions if spam protection expired', () => {
            expect(spamProtectionActionCreator.expire())
            .toEqual({
                type: SpamProtectionActionType.TokenExpired,
            });
        });
    });
});
