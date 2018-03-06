import { createTimeout } from '@bigcommerce/request-sender';
import { getResponse } from '../../common/http-request/responses.mock';
import {
    deleteInstrumentResponseBody,
    getErrorInstrumentResponseBody,
    getInstrumentsResponseBody,
    getVaultAccessTokenResponseBody,
    vaultInstrumentResponseBody,
} from './instrument.mock';
import InstrumentRequestSender from './instrument-request-sender';

describe('InstrumentMethodRequestSender', () => {
    let client;
    let instrumentRequestSender;
    let requestSender;

    beforeEach(() => {
        requestSender = {
            get: jest.fn(() => Promise.resolve()),
        };

        client = {
            getVaultAccessToken: jest.fn((payload, callback) => callback()),
            getShopperInstruments: jest.fn((payload, callback) => callback()),
            postShopperInstrument: jest.fn((payload, callback) => callback()),
            deleteShopperInstrument: jest.fn((payload, callback) => callback()),
        };

        instrumentRequestSender = new InstrumentRequestSender(client, requestSender);
    });

    describe('#getVaultAccessToken()', () => {
        let response;

        beforeEach(() => {
            response = getResponse(getVaultAccessTokenResponseBody());

            requestSender.get.mockReturnValue(Promise.resolve(response));
        });

        it('loads vault access token', async () => {
            const output = await instrumentRequestSender.getVaultAccessToken();

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith(expect.any(String), { timeout: undefined });
        });

        it('loads vault access token with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await instrumentRequestSender.getVaultAccessToken(options);

            expect(output).toEqual(response);
            expect(requestSender.get).toHaveBeenCalledWith(expect.any(String), options);
        });
    });

    describe('#getInstruments()', () => {
        it('returns instruments if request is successful', async () => {
            client.getShopperInstruments = jest.fn((payload, callback) => callback(null, {
                data: getInstrumentsResponseBody(),
                status: 200,
                statusText: 'OK',
            }));

            const response = await instrumentRequestSender.getInstruments();

            expect(response).toEqual({
                headers: {},
                body: getInstrumentsResponseBody(),
                status: 200,
                statusText: 'OK',
            });
        });

        it('returns error response if request is unsuccessful', async () => {
            client.getShopperInstruments = jest.fn((payload, callback) => callback({
                data: getErrorInstrumentResponseBody(),
                status: 400,
                statusText: 'Bad Request',
            }));

            try {
                await instrumentRequestSender.getInstruments();
            } catch (error) {
                expect(error).toEqual({
                    body: getErrorInstrumentResponseBody(),
                    headers: {},
                    status: 400,
                    statusText: 'Bad Request',
                });
            }
        });
    });

    describe('#vaultInstrument()', () => {
        it('returns an instrument if submission is successful', async () => {
            client.postShopperInstrument = jest.fn((payload, callback) => callback(null, {
                data: vaultInstrumentResponseBody(),
                status: 200,
                statusText: 'OK',
            }));

            const response = await instrumentRequestSender.vaultInstrument();

            expect(response).toEqual({
                body: vaultInstrumentResponseBody(),
                headers: {},
                status: 200,
                statusText: 'OK',
            });
        });

        it('returns error response if submission is unsuccessful', async () => {
            client.postShopperInstrument = jest.fn((payload, callback) => callback({
                data: getErrorInstrumentResponseBody(),
                status: 400,
                statusText: 'Bad Request',
            }));

            try {
                await instrumentRequestSender.vaultInstrument();
            } catch (error) {
                expect(error).toEqual({
                    body: getErrorInstrumentResponseBody(),
                    headers: {},
                    status: 400,
                    statusText: 'Bad Request',
                });
            }
        });
    });

    describe('#deleteInstrument()', () => {
        it('deletes an instrument if request is successful', async () => {
            client.deleteShopperInstrument = jest.fn((payload, callback) => callback(null, {
                data: deleteInstrumentResponseBody(),
                status: 200,
                statusText: 'OK',
            }));

            const response = await instrumentRequestSender.deleteInstrument();

            expect(response).toEqual({
                headers: {},
                body: deleteInstrumentResponseBody(),
                status: 200,
                statusText: 'OK',
            });
            expect(client.deleteShopperInstrument).toHaveBeenCalled();
        });

        it('returns error response if request is unsuccessful', async () => {
            client.deleteShopperInstrument = jest.fn((payload, callback) => callback({
                data: getErrorInstrumentResponseBody(),
                status: 400,
                statusText: 'Bad Request',
            }));

            try {
                await instrumentRequestSender.deleteInstrument();
            } catch (error) {
                expect(error).toEqual({
                    body: getErrorInstrumentResponseBody(),
                    headers: {},
                    status: 400,
                    statusText: 'Bad Request',
                });
            }
        });
    });
});
