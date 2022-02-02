import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { ErrorResponseBody } from '../common/error';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import PickupOptionActionCreator from './pickup-option-action-creator';
import { PickupOptionActionType } from './pickup-option-actions';
import PickupOptionRequestSender from './pickup-option-request-sender';
import { getPickupOptionsResponseBody, getQueryForPickupOptions } from './pickup-option.mock';

describe('PickupOptionActionCreator', () => {
    let pickupOptionRequestSender: PickupOptionRequestSender;
    let pickupOptionActionCreator: PickupOptionActionCreator;
    let errorResponse: Response<ErrorResponseBody>;
    let response: Response<any>;

    beforeEach(() => {
        response = getResponse(getPickupOptionsResponseBody());
        errorResponse = getErrorResponse();

        pickupOptionRequestSender = new PickupOptionRequestSender(createRequestSender());
        pickupOptionActionCreator = new PickupOptionActionCreator(pickupOptionRequestSender);

        jest.spyOn(pickupOptionRequestSender, 'fetchPickupOptions').mockReturnValue(Promise.resolve(response));
    });

    it('emits actions if able to fetch pickup options', () => {
        pickupOptionActionCreator.loadPickupOptions(getQueryForPickupOptions())
            .pipe(toArray())
            .subscribe(actions => {
                expect(actions).toEqual([
                    { type: PickupOptionActionType.LoadPickupOptionsRequested },
                    { type: PickupOptionActionType.LoadPickupOptionsSucceeded, payload: response.body.results },
                ]);
            });
    });

    it('emits error actions if unable to fetch pickup options', () => {
        jest.spyOn(pickupOptionRequestSender, 'fetchPickupOptions').mockReturnValue(Promise.reject(errorResponse));

        const errorHandler = jest.fn(action => of(action));

        pickupOptionActionCreator.loadPickupOptions(getQueryForPickupOptions())
            .pipe(
                catchError(errorHandler),
                toArray()
            )
            .subscribe(actions => {
                expect(actions).toEqual([
                    { type: PickupOptionActionType.LoadPickupOptionsRequested },
                    { type: PickupOptionActionType.LoadPickupOptionsFailed, payload: errorResponse, error: true },
                ]);
            });
    });
});
