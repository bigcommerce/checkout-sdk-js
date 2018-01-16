import { Observable } from 'rxjs';
import { getErrorResponse, getResponse } from '../../common/http-request/responses.mock';
import * as actionTypes from './instrument-action-types';
import InstrumentActionCreator from './instrument-action-creator';
import {
    getVaultAccessTokenResponseBody,
    getInstrumentsResponseBody,
    vaultInstrumentResponseBody,
    deleteInstrumentResponseBody,
} from './instrument.mock';

describe('InstrumentActionCreator', () => {
    let instrumentActionCreator;
    let checkoutClient;
    let getVaultAccessTokenResponse;
    let getInstrumentsResponse;
    let vaultInstrumentResponse;
    let deleteInstrumentResponse;
    let errorResponse;

    beforeEach(() => {
        errorResponse = getErrorResponse();
        getVaultAccessTokenResponse = getResponse(getVaultAccessTokenResponseBody());
        getInstrumentsResponse = getResponse(getInstrumentsResponseBody());
        vaultInstrumentResponse = getResponse(vaultInstrumentResponseBody());
        deleteInstrumentResponse = getResponse(deleteInstrumentResponseBody());

        checkoutClient = {
            getVaultAccessToken: jest.fn(() => Promise.resolve(getVaultAccessTokenResponse)),
            getInstruments: jest.fn(() => Promise.resolve(getInstrumentsResponse)),
            vaultInstrument: jest.fn(() => Promise.resolve(vaultInstrumentResponse)),
            deleteInstrument: jest.fn(() => Promise.resolve(deleteInstrumentResponse)),
        };

        instrumentActionCreator = new InstrumentActionCreator(checkoutClient);
    });

    describe('#getInstruments()', () => {
        it('sends a request to get a list of instruments', async () => {
            await instrumentActionCreator.loadInstruments().toPromise();

            expect(checkoutClient.getVaultAccessToken).toHaveBeenCalled();
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

    describe('#vaultInstrument()', () => {
        it('post a new instrument', async () => {
            await instrumentActionCreator.vaultInstrument().toPromise();

            expect(checkoutClient.getVaultAccessToken).toHaveBeenCalled();
            expect(checkoutClient.vaultInstrument).toHaveBeenCalled();
        });

        it('emits actions if able to post instrument', () => {
            instrumentActionCreator.vaultInstrument()
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.VAULT_INSTRUMENT_REQUESTED },
                        { type: actionTypes.VAULT_INSTRUMENT_SUCCEEDED, payload: getInstrumentsResponse.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to post instrument', () => {
            checkoutClient.vaultInstrument.mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));

            instrumentActionCreator.vaultInstrument()
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.VAULT_INSTRUMENT_REQUESTED },
                        { type: actionTypes.VAULT_INSTRUMENT_FAILED, payload: errorResponse, error: true },
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

            expect(checkoutClient.getVaultAccessToken).toHaveBeenCalledWith(storeId, shopperId);
            expect(checkoutClient.deleteInstrument).toHaveBeenCalledWith(
                storeId,
                shopperId,
                instrumentId,
                getVaultAccessTokenResponse.body.data.token
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
