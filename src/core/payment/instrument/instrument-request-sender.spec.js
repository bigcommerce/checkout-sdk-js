import {
    getShopperTokenResponseBody,
    getInstrumentsResponseBody,
    getErrorInstrumentResponseBody,
} from './instrument.mock';
import InstrumentRequestSender from './instrument-request-sender';

describe('InstrumentMethodRequestSender', () => {
    let instrumentRequestSender;
    let client;

    beforeEach(() => {
        client = {
            getShopperToken: jest.fn((payload, callback) => callback()),
            getShopperInstruments: jest.fn((payload, callback) => callback()),
        };

        instrumentRequestSender = new InstrumentRequestSender(client);
    });

    describe('#getShopperToken()', () => {
        it('returns a shopperToken if request is successful', async () => {
            client.getShopperToken = jest.fn((payload, callback) => callback(null, {
                data: getShopperTokenResponseBody(),
                status: 200,
                statusText: 'OK',
            }));

            const response = await instrumentRequestSender.getShopperToken();

            expect(response).toEqual({
                headers: {},
                body: getShopperTokenResponseBody(),
                status: 200,
                statusText: 'OK',
            });
        });

        it('returns error response if request is unsuccessful', async () => {
            client.getShopperToken = jest.fn((payload, callback) => callback({
                data: getErrorInstrumentResponseBody(),
                status: 400,
                statusText: 'Bad Request',
            }));

            try {
                await instrumentRequestSender.getShopperToken();
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
});
