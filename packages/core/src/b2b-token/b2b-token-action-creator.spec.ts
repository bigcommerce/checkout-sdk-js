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

    const b2bResponse = getResponse({ code: 200, data: { token: 'b2b-auth-token' } });

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        requestSender = new B2BTokenRequestSender(createRequestSender());

        jest.spyOn(requestSender, 'getB2BToken').mockResolvedValue(b2bResponse);

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

        it('calls getB2BToken with b2bApiSettings from initial state', async () => {
            const customer = getCustomer();
            const checkout = getCheckout();
            const b2bApiSettings = {
                clientId: 'dl7c39mdpul6hyc489yk0vzxl6jesyx',
                baseUrl: 'https://api-b2b.bigcommerce.com',
            };

            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue({
                ...getConfig().storeConfig,
                b2bApiSettings,
            });

            await from(actionCreator.loadB2BToken()(store)).toPromise();

            expect(requestSender.getB2BToken).toHaveBeenCalledWith(
                b2bApiSettings.clientId,
                customer.id,
                getConfig().storeConfig.storeProfile.storeHash,
                checkout.channelId,
                b2bApiSettings.baseUrl,
                undefined,
            );
        });

        it('emits error actions if getB2BToken fails', async () => {
            jest.spyOn(requestSender, 'getB2BToken').mockRejectedValue(getErrorResponse());

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
