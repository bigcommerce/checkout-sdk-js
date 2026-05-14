import { createRequestSender } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { CheckoutStore, createCheckoutStore } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getConfig } from '../config/configs.mock';

import PoConfigActionCreator from './po-config-action-creator';
import { PoConfigActionType } from './po-config-actions';
import PoConfigRequestSender from './po-config-request-sender';

describe('PoConfigActionCreator', () => {
    let store: CheckoutStore;
    let requestSender: PoConfigRequestSender;
    let actionCreator: PoConfigActionCreator;

    const responseBody = {
        code: 200,
        message: 'SUCCESS',
        data: {
            checkoutPaymentPurchaseEnableExtra: { id: 1, value: '1', type: 'checkbox' },
            checkoutPaymentPurchaseExtraFields: {
                id: 2,
                value: 'PO Number / Reference Number',
                type: 'text',
            },
            checkoutPaymentPurchaseExtraFieldsRequired: { id: 3, value: '1', type: 'checkbox' },
        },
    };

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        requestSender = new PoConfigRequestSender(createRequestSender());

        jest.spyOn(requestSender, 'getPoConfig').mockResolvedValue(getResponse(responseBody));

        jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue(
            getConfig().storeConfig,
        );

        actionCreator = new PoConfigActionCreator(requestSender);
    });

    describe('#loadPoConfig()', () => {
        it('emits load actions on success with a normalised payload', async () => {
            const actions = await from(actionCreator.loadPoConfig()(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: PoConfigActionType.LoadPoConfigRequested },
                {
                    type: PoConfigActionType.LoadPoConfigSucceeded,
                    payload: {
                        enabled: true,
                        label: 'PO Number / Reference Number',
                        required: true,
                    },
                },
            ]);
        });

        it('normalises "0"/"1" string flags into booleans', async () => {
            jest.spyOn(requestSender, 'getPoConfig').mockResolvedValue(
                getResponse({
                    code: 200,
                    message: 'SUCCESS',
                    data: {
                        checkoutPaymentPurchaseEnableExtra: {
                            id: 1,
                            value: '0',
                            type: 'checkbox',
                        },
                        checkoutPaymentPurchaseExtraFields: {
                            id: 2,
                            value: 'PO Number',
                            type: 'text',
                        },
                        checkoutPaymentPurchaseExtraFieldsRequired: {
                            id: 3,
                            value: '0',
                            type: 'checkbox',
                        },
                    },
                }),
            );

            const actions = await from(actionCreator.loadPoConfig()(store))
                .pipe(toArray())
                .toPromise();

            expect(actions[1]).toEqual({
                type: PoConfigActionType.LoadPoConfigSucceeded,
                payload: { enabled: false, label: 'PO Number', required: false },
            });
        });

        it('calls getPoConfig with the B2B clientId, base URL and token from state', async () => {
            const b2bApiSettings = {
                clientId: 'dl7c39mdpul6hyc489yk0vzxl6jesyx',
                baseUrl: 'https://api-b2b.bigcommerce.com',
            };

            jest.spyOn(store.getState().config, 'getStoreConfigOrThrow').mockReturnValue({
                ...getConfig().storeConfig,
                b2bApiSettings,
            });
            jest.spyOn(store.getState().b2bToken, 'getToken').mockReturnValue('my-b2b-token');

            await from(actionCreator.loadPoConfig()(store)).toPromise();

            expect(requestSender.getPoConfig).toHaveBeenCalledWith(
                b2bApiSettings.clientId,
                b2bApiSettings.baseUrl,
                'my-b2b-token',
                undefined,
            );
        });

        it('passes empty-string token when no B2B token has been loaded', async () => {
            jest.spyOn(store.getState().b2bToken, 'getToken').mockReturnValue(undefined);

            await from(actionCreator.loadPoConfig()(store)).toPromise();

            expect(requestSender.getPoConfig).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                '',
                undefined,
            );
        });

        it('emits error actions if getPoConfig fails', async () => {
            jest.spyOn(requestSender, 'getPoConfig').mockRejectedValue(getErrorResponse());

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(actionCreator.loadPoConfig()(store))
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: PoConfigActionType.LoadPoConfigRequested },
                expect.objectContaining({
                    type: PoConfigActionType.LoadPoConfigFailed,
                    error: true,
                }),
            ]);
        });
    });
});
