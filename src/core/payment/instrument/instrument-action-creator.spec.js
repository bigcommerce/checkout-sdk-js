import { Observable } from 'rxjs';
import { getErrorResponse, getResponse } from '../../../http-request/responses.mock';
import { getErrorResponseBody } from '../../common/error/errors.mock';
import * as actionTypes from './instrument-action-types';
import InstrumentActionCreator from './instrument-action-creator';
import {
    getShopperTokenResponseBody,
    getInstrumentsResponseBody,
} from './instrument.mock';

describe('InstrumentActionCreator', () => {
    let instrumentActionCreator;
    let checkoutClient;
    let getShopperTokenResponse;
    let getInstrumentsResponse;
    let errorResponse;

    beforeEach(() => {
        errorResponse = getErrorResponse(getErrorResponseBody());
        getShopperTokenResponse = getResponse(getShopperTokenResponseBody());
        getInstrumentsResponse = getResponse(getInstrumentsResponseBody());

        checkoutClient = {
            getShopperToken: jest.fn(() => Promise.resolve(getShopperTokenResponse)),
            getInstruments: jest.fn(() => Promise.resolve(getInstrumentsResponse)),
        };

        instrumentActionCreator = new InstrumentActionCreator(checkoutClient);
    });

    describe('#getInstruments()', () => {
        it('sends a request to get a list of instruments', async () => {
            await instrumentActionCreator.loadInstruments().toPromise();

            expect(checkoutClient.getShopperToken).toHaveBeenCalled();
            expect(checkoutClient.getInstruments).toHaveBeenCalled();
        });

        it('emits actions if able to load instruments', () => {
            instrumentActionCreator.loadInstruments()
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_INSTRUMENTS_REQUESTED },
                        { type: actionTypes.LOAD_INSTRUMENTS_SUCCEEDED, payload: getInstrumentsResponse.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to load instruments', () => {
            checkoutClient.getInstruments.mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));

            instrumentActionCreator.loadInstruments()
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_INSTRUMENTS_REQUESTED },
                        { type: actionTypes.LOAD_INSTRUMENTS_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
