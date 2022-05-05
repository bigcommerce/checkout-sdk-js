import { createRequestSender, RequestSender, Response } from '@bigcommerce/request-sender';
import { merge, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import Config from './config';
import ConfigActionCreator from './config-action-creator';
import { ConfigActionType } from './config-actions';
import ConfigRequestSender from './config-request-sender';
import { getConfig } from './configs.mock';

describe('ConfigActionCreator', () => {
    let requestSender: RequestSender;
    let configRequestSender: ConfigRequestSender;
    let configActionCreator: ConfigActionCreator;
    let errorResponse: Response<any>;
    let response: Response<Config>;

    beforeEach(() => {
        requestSender = createRequestSender();
        configRequestSender = new ConfigRequestSender(requestSender);
        configActionCreator = new ConfigActionCreator(configRequestSender);

        response = getResponse(getConfig());
        errorResponse = getErrorResponse();

        jest.spyOn(configRequestSender, 'loadConfig')
            .mockReturnValue(Promise.resolve(response));
    });

    describe('#loadConfig()', () => {
        it('emits actions if able to load config', async () => {
            const actions = await configActionCreator.loadConfig()
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: ConfigActionType.LoadConfigRequested },
                { type: ConfigActionType.LoadConfigSucceeded, payload: response.body },
            ]);
        });

        it('emits error actions if unable to load config', async () => {
            jest.spyOn(configRequestSender, 'loadConfig').mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => of(action));
            const actions = await configActionCreator.loadConfig()
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: ConfigActionType.LoadConfigRequested },
                { type: ConfigActionType.LoadConfigFailed, payload: errorResponse, error: true },
            ]);
        });

        it('dispatches actions using cached responses if available', async () => {
            const actions = await merge(
                configActionCreator.loadConfig({ useCache: true }),
                configActionCreator.loadConfig({ useCache: true })
            )
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: ConfigActionType.LoadConfigRequested },
                { type: ConfigActionType.LoadConfigRequested },
                { type: ConfigActionType.LoadConfigSucceeded, payload: response.body },
                { type: ConfigActionType.LoadConfigSucceeded, payload: response.body },
            ]);

            expect(configRequestSender.loadConfig).toHaveBeenCalledTimes(1);
        });
    });
});
