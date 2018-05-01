import { Observable } from 'rxjs';
import { getAppConfig } from './configs.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import * as actionTypes from './config-action-types';
import ConfigActionCreator from './config-action-creator';

describe('ConfigActionCreator', () => {
    let checkoutClient;
    let configActionCreator;
    let errorResponse;
    let response;

    beforeEach(() => {
        response = getResponse(getAppConfig());
        errorResponse = getErrorResponse();

        checkoutClient = {
            loadConfig: jest.fn(() => Promise.resolve(response)),
        };

        configActionCreator = new ConfigActionCreator(checkoutClient);
    });

    describe('#loadConfig()', () => {
        it('emits actions if able to load config', () => {
            configActionCreator.loadConfig()
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_CONFIG_REQUESTED },
                        { type: actionTypes.LOAD_CONFIG_SUCCEEDED, payload: response.body },
                    ]);
                });
        });

        it('emits error actions if unable to load config', () => {
            checkoutClient.loadConfig.mockReturnValue(Promise.reject(errorResponse));
            const errorHandler = jest.fn((action) => Observable.of(action));

            configActionCreator.loadConfig()
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_CONFIG_REQUESTED },
                        { type: actionTypes.LOAD_CONFIG_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
