import { createTimeout } from '@bigcommerce/request-sender';
import { getResponse } from '../../common/http-request/responses.mock';
import { getShippingAddress } from '../../shipping/shipping-addresses.mock';
import { getShippingAddress as getInternalShippingAddress } from '../../shipping/internal-shipping-addresses.mock';
import {
    deleteInstrumentResponseBody,
    getErrorInstrumentResponseBody,
    getLoadInstrumentsResponseBody,
    getVaultAccessTokenResponseBody,
    instrumentRequestContext,
} from './instrument.mock';

import InstrumentRequestSender from './instrument-request-sender';

describe('InstrumentMethodRequestSender', () => {
    let client;
    let instrumentRequestSender;
    let requestContext;
    let requestSender;
    let shippingAddress;

    beforeEach(() => {
        requestSender = {
            get: jest.fn(() => Promise.resolve()),
        };

        client = {
            getVaultAccessToken: jest.fn((payload, callback) => callback()),
            loadInstruments: jest.fn((payload, callback) => callback()),
            loadInstrumentsWithAddress: jest.fn((payload, callback) => callback()),
            deleteShopperInstrument: jest.fn((payload, callback) => callback()),
        };

        requestContext = instrumentRequestContext();
        instrumentRequestSender = new InstrumentRequestSender(client, requestSender);
        shippingAddress = getShippingAddress();
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

    describe('#loadInstruments()', () => {
        it('returns instruments if request is successful', async () => {
            client.loadInstruments = jest.fn((payload, callback) => callback(null, {
                data: getLoadInstrumentsResponseBody(),
                status: 200,
                statusText: 'OK',
            }));

            const response = await instrumentRequestSender.loadInstruments(requestContext);

            expect(response).toEqual({
                headers: {},
                body: getLoadInstrumentsResponseBody(),
                status: 200,
                statusText: 'OK',
            });

            expect(client.loadInstrumentsWithAddress).not.toHaveBeenCalled();
            expect(client.loadInstruments).toHaveBeenCalledWith(
                requestContext,
                expect.any(Function)
            );
        });

        it('returns error response if request is unsuccessful', async () => {
            client.loadInstruments = jest.fn((payload, callback) => callback({
                data: getErrorInstrumentResponseBody(),
                status: 400,
                statusText: 'Bad Request',
            }));

            try {
                await instrumentRequestSender.loadInstruments();
            } catch (error) {
                expect(error).toEqual({
                    body: getErrorInstrumentResponseBody(),
                    headers: {},
                    status: 400,
                    statusText: 'Bad Request',
                });
            }
        });

        it('returns loads trusted instruments if shipping address is available', async () => {
            client.loadInstrumentsWithAddress = jest.fn((payload, callback) => callback(null, {
                data: getLoadInstrumentsResponseBody(),
                status: 200,
                statusText: 'OK',
            }));

            const response = await instrumentRequestSender.loadInstruments(requestContext, shippingAddress);

            expect(response).toEqual({
                headers: {},
                body: getLoadInstrumentsResponseBody(),
                status: 200,
                statusText: 'OK',
            });

            expect(client.loadInstruments).not.toHaveBeenCalled();
            expect(client.loadInstrumentsWithAddress).toHaveBeenCalledWith(
                {
                    ...requestContext,
                    shippingAddress: getInternalShippingAddress(),
                },
                expect.any(Function)
            );
        });
    });

    describe('#deleteInstrument()', () => {
        it('deletes an instrument if request is successful', async () => {
            client.deleteShopperInstrument = jest.fn((payload, callback) => callback(null, {
                data: deleteInstrumentResponseBody(),
                status: 200,
                statusText: 'OK',
            }));

            const instrumentId = '123';
            const response = await instrumentRequestSender.deleteInstrument(requestContext, instrumentId);

            expect(response).toEqual({
                headers: {},
                body: deleteInstrumentResponseBody(),
                status: 200,
                statusText: 'OK',
            });
            expect(client.deleteShopperInstrument).toHaveBeenCalledWith({
                ...requestContext,
                instrumentId,
            }, expect.any(Function));
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
