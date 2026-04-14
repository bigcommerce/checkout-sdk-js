import { createRequestSender } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { CheckoutStore, createCheckoutStore } from '../checkout';
import { getCheckout, getCheckoutStoreState } from '../checkout/checkouts.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getConfig } from '../config/configs.mock';
import { getCustomer } from '../customer/customers.mock';

import B2BTokenActionCreator from './b2b-token-action-creator';
import { B2BTokenActionType } from './b2b-token-actions';
import B2BTokenRequestSender from './b2b-token-request-sender';

describe('B2BTokenActionCreator', () => {
    let store: CheckoutStore;
    let requestSender: B2BTokenRequestSender;
    let actionCreator: B2BTokenActionCreator;

    const jwtResponse = getResponse({ token: 'bc-jwt-token' });
    const b2bResponse = getResponse({ code: 200, data: { token: 'b2b-auth-token' } });

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        requestSender = new B2BTokenRequestSender(createRequestSender());

        jest.spyOn(requestSender, 'getBCJWT').mockResolvedValue(jwtResponse);
        jest.spyOn(requestSender, 'fetchB2BToken').mockResolvedValue(b2bResponse);

        jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(
            getConfig().storeConfig,
        );
        jest.spyOn(store.getState().customer, 'getCustomerOrThrow').mockReturnValue(getCustomer());
        jest.spyOn(store.getState().checkout, 'getCheckoutOrThrow').mockReturnValue(getCheckout());

        actionCreator = new B2BTokenActionCreator(requestSender);
    });

    describe('#loadB2BToken()', () => {
        it('emits load actions on success', async () => {
            const actions = await from(actionCreator.loadB2BToken()(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: B2BTokenActionType.LoadB2BTokenRequested },
                {
                    type: B2BTokenActionType.LoadB2BTokenSucceeded,
                    payload: { token: 'b2b-auth-token' },
                },
            ]);
        });

        it('calls getBCJWT with b2bClientId from checkout settings', async () => {
            const { b2bClientId } = getConfig().storeConfig.checkoutSettings;

            await from(actionCreator.loadB2BToken()(store)).toPromise();

            expect(requestSender.getBCJWT).toHaveBeenCalledWith(b2bClientId ?? '', undefined);
        });

        it('calls fetchB2BToken with state data, BC JWT, and b2bBaseUrl from checkout settings', async () => {
            const customer = getCustomer();
            const checkout = getCheckout();
            const { storeHash } = getConfig().storeConfig.storeProfile;
            const { b2bBaseUrl } = getConfig().storeConfig.checkoutSettings;

            await from(actionCreator.loadB2BToken()(store)).toPromise();

            expect(requestSender.fetchB2BToken).toHaveBeenCalledWith(
                'bc-jwt-token',
                customer.id,
                storeHash,
                checkout.channelId,
                undefined,
                b2bBaseUrl,
            );
        });

        it('emits error actions if getBCJWT fails', async () => {
            jest.spyOn(requestSender, 'getBCJWT').mockRejectedValue(getErrorResponse());

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(actionCreator.loadB2BToken()(store))
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: B2BTokenActionType.LoadB2BTokenRequested },
                expect.objectContaining({
                    type: B2BTokenActionType.LoadB2BTokenFailed,
                    error: true,
                }),
            ]);
        });

        it('emits error actions if fetchB2BToken fails', async () => {
            jest.spyOn(requestSender, 'fetchB2BToken').mockRejectedValue(getErrorResponse());

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(actionCreator.loadB2BToken()(store))
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: B2BTokenActionType.LoadB2BTokenRequested },
                expect.objectContaining({
                    type: B2BTokenActionType.LoadB2BTokenFailed,
                    error: true,
                }),
            ]);
        });
    });
});
