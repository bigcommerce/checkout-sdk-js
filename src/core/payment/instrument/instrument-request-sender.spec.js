import {
    getVaultAccessTokenResponseBody,
    getInstrumentsResponseBody,
    vaultInstrumentResponseBody,
    getErrorInstrumentResponseBody,
} from './instrument.mock';
import InstrumentRequestSender from './instrument-request-sender';

describe('InstrumentMethodRequestSender', () => {
    let instrumentRequestSender;
    let client;

    beforeEach(() => {
        client = {
            getVaultAccessToken: jest.fn((payload, callback) => callback()),
            getShopperInstruments: jest.fn((payload, callback) => callback()),
            postShopperInstrument: jest.fn((payload, callback) => callback()),
            deleteShopperInstrument: jest.fn((payload, callback) => callback()),
        };

        instrumentRequestSender = new InstrumentRequestSender(client);
    });

    describe('#getVaultAccessToken()', () => {
        it('returns a vault access token if request is successful', async () => {
            client.getVaultAccessToken = jest.fn((payload, callback) => callback(null, {
                data: getVaultAccessTokenResponseBody(),
                status: 200,
                statusText: 'OK',
            }));

            const response = await instrumentRequestSender.getVaultAccessToken();

            expect(response).toEqual({
                headers: {},
                body: getVaultAccessTokenResponseBody(),
                status: 200,
                statusText: 'OK',
            });
        });

        it('returns error response if request is unsuccessful', async () => {
            client.getVaultAccessToken = jest.fn((payload, callback) => callback({
                data: getErrorInstrumentResponseBody(),
                status: 400,
                statusText: 'Bad Request',
            }));

            try {
                await instrumentRequestSender.getVaultAccessToken();
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
                headers: {},
                body: vaultInstrumentResponseBody(),
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
                data: {},
                status: 200,
                statusText: 'OK',
            }));

            const response = await instrumentRequestSender.deleteInstrument();

            expect(response).toEqual({
                headers: {},
                body: {},
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
