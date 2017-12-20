import { Observable } from 'rxjs';
import { getErrorResponse, getResponse } from '../../../http-request/responses.mock';
import { getErrorResponseBody } from '../../common/error/errors.mock';
import * as actionTypes from './instrument-action-types';
import InstrumentActionCreator from './instrument-action-creator';
import {
    getShopperTokenResponseBody,
    getInstrumentsResponseBody,
    deleteInstrumentResponseBody,
} from './instrument.mock';

describe('InstrumentActionCreator', () => {
    let instrumentActionCreator;
    let checkoutClient;
    let getShopperTokenResponse;
    let getInstrumentsResponse;
    let deleteInstrumentResponse;
    let errorResponse;

    beforeEach(() => {
        errorResponse = getErrorResponse(getErrorResponseBody());
        getShopperTokenResponse = getResponse(getShopperTokenResponseBody());
        getInstrumentsResponse = getResponse(getInstrumentsResponseBody());
        deleteInstrumentResponse = getResponse(deleteInstrumentResponseBody());

        checkoutClient = {
            getShopperToken: jest.fn(() => Promise.resolve(getShopperTokenResponse)),
            getInstruments: jest.fn(() => Promise.resolve(getInstrumentsResponse)),
            deleteInstrument: jest.fn(() => Promise.resolve(deleteInstrumentResponse)),
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

    describe('#deleteInstrument()', () => {
        let storeId;
        let shopperId;
        let instrumentId;

        beforeEach(() => {
            storeId = '1';
            shopperId = '2';
            instrumentId = '123';
        });

        it('delete an instrument', async () => {
            await instrumentActionCreator.deleteInstrument(storeId, shopperId, instrumentId).toPromise();

            expect(checkoutClient.getShopperToken).toHaveBeenCalledWith(storeId, shopperId);
            expect(checkoutClient.deleteInstrument).toHaveBeenCalledWith(
                storeId,
                shopperId,
                instrumentId,
                getShopperTokenResponse.body.data.token
            );
        });

        it('emits actions if able to delete an instrument', (done) => {
            instrumentActionCreator.deleteInstrument(storeId, shopperId, instrumentId)
                .toArray()
                .subscribe((actions) => {
                    done();

                    expect(actions).toEqual([
                        { type: actionTypes.DELETE_INSTRUMENT_REQUESTED, meta: { instrumentId } },
                        { type: actionTypes.DELETE_INSTRUMENT_SUCCEEDED, meta: { instrumentId }, payload: getInstrumentsResponse.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to delete an instrument', (done) => {
            checkoutClient.deleteInstrument.mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));

            instrumentActionCreator.deleteInstrument(storeId, shopperId, instrumentId)
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    done();

                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.DELETE_INSTRUMENT_REQUESTED, meta: { instrumentId } },
                        { type: actionTypes.DELETE_INSTRUMENT_FAILED, meta: { instrumentId }, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
