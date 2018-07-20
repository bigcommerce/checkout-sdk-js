import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';

import { createCheckoutStore, CheckoutStore } from '../checkout';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import { ConfigRequestSender } from '.';
import Config from './config';
import ConfigActionCreator from './config-action-creator';
import { ConfigActionType } from './config-actions';
import { getConfig, getConfigState } from './configs.mock';

describe('ConfigActionCreator', () => {
    const requestSender = createRequestSender();
    const configRequestSender = new ConfigRequestSender(requestSender);
    const configActionCreator = new ConfigActionCreator(configRequestSender);
    let errorResponse: Response<any>;
    let response: Response<Config>;
    let store: CheckoutStore;

    beforeEach(() => {
        response = getResponse(getConfig());
        errorResponse = getErrorResponse();
        store = createCheckoutStore();

        jest.spyOn(configRequestSender, 'loadConfig').mockReturnValue(Promise.resolve(response));
    });

    describe('#loadConfig()', () => {
        it('emits actions if able to load config', async () => {
            const actions = await Observable.from(configActionCreator.loadConfig()(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: ConfigActionType.LoadConfigRequested },
                { type: ConfigActionType.LoadConfigSucceeded, payload: response.body },
            ]);
        });

        it('emits error actions if unable to load config', async () => {
            jest.spyOn(configRequestSender, 'loadConfig').mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => Observable.of(action));
            const actions = await Observable.from(configActionCreator.loadConfig()(store))
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: ConfigActionType.LoadConfigRequested },
                { type: ConfigActionType.LoadConfigFailed, payload: errorResponse, error: true },
            ]);
        });

        it('does not emit actions if config is already loaded', async () => {
            store = createCheckoutStore({ config: getConfigState() });

            const actions = await Observable.from(configActionCreator.loadConfig()(store))
                .toArray()
                .toPromise();

            expect(actions).toEqual([]);
        });
    });
});
