import { Observable } from 'rxjs';

import { createCheckoutStore } from '../checkout';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import ConfigActionCreator from './config-action-creator';
import { ConfigActionType } from './config-actions';
import { getConfig, getConfigState } from './configs.mock';

describe('ConfigActionCreator', () => {
    let checkoutClient;
    let configActionCreator;
    let errorResponse;
    let response;
    let store;

    beforeEach(() => {
        response = getResponse(getConfig());
        errorResponse = getErrorResponse();
        store = createCheckoutStore();

        checkoutClient = {
            loadConfig: jest.fn(() => Promise.resolve(response)),
        };

        configActionCreator = new ConfigActionCreator(checkoutClient);
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
            checkoutClient.loadConfig.mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));
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
