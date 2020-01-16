import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { ScriptLoader } from '@bigcommerce/script-loader';
import { from, of, Subject } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { createCheckoutStore, CheckoutStore, CheckoutStoreState } from '../checkout';
import { getCheckout, getCheckoutState, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { getResponse } from '../common/http-request/responses.mock';

import createSpamProtection from './create-spam-protection';
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
        $event = new Subject<RecaptchaResult>();
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
            const checkout = getCheckout();
            checkout.shouldExecuteSpamCheck = true;
            const checkoutState = getCheckoutState();
            checkoutState.data = checkout;
            const checkoutStoreState = {
                ...getCheckoutStoreState(),
                checkout: checkoutState,
            };
            const state = {
                ...checkoutStoreState,
                order: {
                    errors: {},
                    meta: {},
                    statuses: {},
                },
            };
            const store = createCheckoutStore(state);

            const actions = from(spamProtectionActionCreator.execute()(store))
                .pipe(toArray())
                .toPromise();

            $event.next({ token: 'spamProtectionToken' });

            expect(await actions).toEqual([
                { type: SpamProtectionActionType.ExecuteRequested },
                { type: SpamProtectionActionType.ExecuteSucceeded, payload: response.body },
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
