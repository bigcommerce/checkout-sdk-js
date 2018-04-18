import { Observable } from 'rxjs';
import { addMinutes } from '../../common/date-time';
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
    let storeId;
    let shopperId;
    let instrumentId;
    let vaultAccessExpiry;
    let vaultAccessToken;

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

        storeId = '1';
        shopperId = '2';
        instrumentId = '123';
        vaultAccessExpiry = getVaultAccessTokenResponse.body.data.expires_at;
        vaultAccessToken = getVaultAccessTokenResponse.body.data.token;
    });

    describe('#getInstruments()', () => {
        it('sends a request to get a list of instruments', async () => {
            await instrumentActionCreator.loadInstruments(storeId, shopperId).toPromise();

            expect(checkoutClient.getVaultAccessToken).toHaveBeenCalled();
            expect(checkoutClient.getInstruments).toHaveBeenCalledWith(storeId, shopperId, vaultAccessToken);
        });

        it('does not send a request to get a list of instruments if valid token is supplied', async () => {
            await instrumentActionCreator.loadInstruments(storeId, shopperId, {
                vaultAccessToken: '321',
                vaultAccessExpiry: addMinutes(new Date(), 5),
            }).toPromise();

            expect(checkoutClient.getVaultAccessToken).not.toHaveBeenCalled();
            expect(checkoutClient.getInstruments).toHaveBeenCalledWith(storeId, shopperId, '321');
        });

        it('emits actions if able to load instruments', async () => {
            const actions = await instrumentActionCreator.loadInstruments()
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                {
                    type: actionTypes.LOAD_INSTRUMENTS_REQUESTED,
                },
                {
                    type: actionTypes.LOAD_INSTRUMENTS_SUCCEEDED,
                    meta: { vaultAccessExpiry, vaultAccessToken },
                    payload: getInstrumentsResponse.body,
                },
            ]);
        });

        it('emits error actions if unable to load instruments', async () => {
            checkoutClient.getInstruments.mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));
            const actions = await instrumentActionCreator.loadInstruments()
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: actionTypes.LOAD_INSTRUMENTS_REQUESTED },
                { type: actionTypes.LOAD_INSTRUMENTS_FAILED, payload: errorResponse, error: true },
            ]);
        });
    });

    describe('#vaultInstrument()', () => {
        it('post a new instrument', async () => {
            await instrumentActionCreator.vaultInstrument(storeId, shopperId, null, {}).toPromise();

            expect(checkoutClient.getVaultAccessToken).toHaveBeenCalled();
            expect(checkoutClient.vaultInstrument).toHaveBeenCalledWith(
                storeId,
                shopperId,
                vaultAccessToken,
                expect.any(Object)
            );
        });

        it('does not send a request to get a list of instruments if valid token is supplied', async () => {
            await instrumentActionCreator.vaultInstrument(storeId, shopperId, {
                vaultAccessToken: '321',
                vaultAccessExpiry: addMinutes(new Date(), 5),
            }, {}).toPromise();

            expect(checkoutClient.getVaultAccessToken).not.toHaveBeenCalled();
            expect(checkoutClient.vaultInstrument).toHaveBeenCalledWith(
                storeId,
                shopperId,
                '321',
                expect.any(Object)
            );
        });

        it('emits actions if able to post instrument', async () => {
            const actions = await instrumentActionCreator.vaultInstrument()
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                {
                    type: actionTypes.VAULT_INSTRUMENT_REQUESTED,
                },
                {
                    type: actionTypes.VAULT_INSTRUMENT_SUCCEEDED,
                    meta: { vaultAccessExpiry, vaultAccessToken },
                    payload: vaultInstrumentResponse.body,
                },
            ]);
        });

        it('emits error actions if unable to post instrument', async () => {
            checkoutClient.vaultInstrument.mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));
            const actions = await instrumentActionCreator.vaultInstrument()
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: actionTypes.VAULT_INSTRUMENT_REQUESTED },
                { type: actionTypes.VAULT_INSTRUMENT_FAILED, payload: errorResponse, error: true },
            ]);
        });
    });

    describe('#deleteInstrument()', () => {
        it('deletes an instrument', async () => {
            await instrumentActionCreator.deleteInstrument(storeId, shopperId, vaultAccessToken, instrumentId).toPromise();

            expect(checkoutClient.getVaultAccessToken).toHaveBeenCalled();
            expect(checkoutClient.deleteInstrument).toHaveBeenCalledWith(
                storeId,
                shopperId,
                vaultAccessToken,
                instrumentId,
            );
        });

        it('does not send a request to get a list of instruments if valid token is supplied', async () => {
            await instrumentActionCreator.deleteInstrument(storeId, shopperId, {
                vaultAccessToken: '321',
                vaultAccessExpiry: addMinutes(new Date(), 5),
            }, instrumentId).toPromise();

            expect(checkoutClient.getVaultAccessToken).not.toHaveBeenCalled();
            expect(checkoutClient.deleteInstrument).toHaveBeenCalledWith(
                storeId,
                shopperId,
                '321',
                instrumentId
            );
        });

        it('emits actions if able to delete an instrument', async () => {
            const actions = await instrumentActionCreator.deleteInstrument(storeId, shopperId, vaultAccessToken, instrumentId)
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                {
                    type: actionTypes.DELETE_INSTRUMENT_REQUESTED,
                    meta: { instrumentId },
                },
                {
                    type: actionTypes.DELETE_INSTRUMENT_SUCCEEDED,
                    meta: { instrumentId, vaultAccessExpiry, vaultAccessToken },
                    payload: getInstrumentsResponse.body.data,
                },
            ]);
        });

        it('emits error actions if unable to delete an instrument', async () => {
            checkoutClient.deleteInstrument.mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));
            const actions = await instrumentActionCreator.deleteInstrument(storeId, shopperId, vaultAccessToken, instrumentId)
                .catch(errorHandler)
                .toArray()
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                {
                    type: actionTypes.DELETE_INSTRUMENT_REQUESTED, meta: { instrumentId },
                },
                {
                    type: actionTypes.DELETE_INSTRUMENT_FAILED, meta: { instrumentId }, payload: errorResponse, error: true,
                },
            ]);
        });
    });
});
