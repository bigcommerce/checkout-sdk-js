import { ScriptLoader } from '@bigcommerce/script-loader';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { createCheckoutStore, CheckoutStore, CheckoutStoreState } from '../../checkout';
import { getCheckoutStoreState } from '../../checkout/checkouts.mock';

import createSpamProtection from './create-spam-protection';
import GoogleRecaptcha from './google-recaptcha';
import SpamProtectionActionCreator from './spam-protection-action-creator';
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

        jest.spyOn(googleRecaptcha, 'load').mockImplementation(() => Promise.resolve());
    });

    describe('#initialize()', () => {
        let options: SpamProtectionOptions;

        beforeEach(() => {
            options = {
                containerId: 'spamProtection',
            };

            jest.spyOn(store, 'dispatch');
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
                    meta: 'spamProtection',
                    error: true,
                },
            ]);
        });
    });
});
