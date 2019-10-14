import { createRequestSender, createTimeout, RequestSender, Response } from '@bigcommerce/request-sender';
import { omit } from 'lodash';

import { Address } from '../../address';
import { getPaymentResponse, getResponse } from '../../common/http-request/responses.mock';
import { getShippingAddress as getInternalShippingAddress } from '../../shipping/internal-shipping-addresses.mock';
import { getShippingAddress } from '../../shipping/shipping-addresses.mock';

import { InstrumentRequestContext } from './instrument';
import InstrumentRequestSender from './instrument-request-sender';
import { deleteInstrumentResponseBody, getErrorInstrumentResponseBody, getInstruments, getInternalInstrumentsResponseBody, getLoadInstrumentsResponseBody, getVaultAccessToken, getVaultAccessTokenResponseBody, instrumentRequestContext } from './instrument.mock';

describe('InstrumentRequestSender', () => {
    let client: any;
    let instrumentRequestSender: InstrumentRequestSender;
    let requestContext: InstrumentRequestContext;
    let requestSender: RequestSender;
    let shippingAddress: Address;

    beforeEach(() => {
        requestSender = createRequestSender();

        client = {
            getVaultAccessToken: jest.fn((_, callback) => callback()),
            loadInstruments: jest.fn((_, callback) => callback()),
            loadInstrumentsWithAddress: jest.fn((_, callback) => callback()),
            deleteShopperInstrument: jest.fn((_, callback) => callback()),
        };

        jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve());
        requestContext = instrumentRequestContext();
        instrumentRequestSender = new InstrumentRequestSender(client, requestSender);
        shippingAddress = getShippingAddress();
    });

    describe('#getVaultAccessToken()', () => {
        let response: Response;

        beforeEach(() => {
            response = getResponse(getVaultAccessTokenResponseBody());

            jest.spyOn(requestSender, 'get').mockReturnValue(Promise.resolve(response));
        });

        it('loads vault access token', async () => {
            const output = await instrumentRequestSender.getVaultAccessToken();

            expect(output).toEqual({
                ...response,
                body: getVaultAccessToken(),
            });
            expect(requestSender.get).toHaveBeenCalledWith(expect.any(String), { timeout: undefined });
        });

        it('loads vault access token with timeout', async () => {
            const options = { timeout: createTimeout() };
            const output = await instrumentRequestSender.getVaultAccessToken(options);

            expect(output).toEqual({
                ...response,
                body: {
                    vaultAccessToken: 'VAT f4k3v4ul74cc3sst0k3n',
                    vaultAccessExpiry: 1516097476098,
                },
            });
            expect(requestSender.get).toHaveBeenCalledWith(expect.any(String), options);
        });
    });

    describe('#loadInstruments()', () => {
        it('returns instruments if request is successful', async () => {
            client.loadInstruments = jest.fn((_, callback) => callback(null,
                getPaymentResponse(getInternalInstrumentsResponseBody())
            ));

            const response = await instrumentRequestSender.loadInstruments(requestContext);

            expect(response).toEqual(getResponse({
                vaultedInstruments: getInstruments(),
            }));

            expect(client.loadInstrumentsWithAddress).not.toHaveBeenCalled();
            expect(client.loadInstruments).toHaveBeenCalledWith(
                requestContext,
                expect.any(Function)
            );
        });

        it('returns error response if request is unsuccessful', async () => {
            client.loadInstruments = jest.fn((_, callback) => callback(
                getPaymentResponse(getErrorInstrumentResponseBody(), {}, 400, 'Bad Request')
            ));

            try {
                await instrumentRequestSender.loadInstruments(requestContext);
            } catch (error) {
                expect(error)
                    .toEqual(getResponse(getErrorInstrumentResponseBody(), {}, 400, 'Bad Request'));
            }
        });

        it('returns loads trusted instruments if shipping address is available', async () => {
            client.loadInstrumentsWithAddress = jest.fn((_, callback) => callback(null,
                getPaymentResponse(getInternalInstrumentsResponseBody())
            ));

            const response = await instrumentRequestSender.loadInstruments(requestContext, shippingAddress);

            expect(response).toEqual(getResponse(getLoadInstrumentsResponseBody()));

            expect(client.loadInstruments).not.toHaveBeenCalled();
            expect(client.loadInstrumentsWithAddress).toHaveBeenCalledWith(
                {
                    ...requestContext,
                    shippingAddress: omit(getInternalShippingAddress(), 'id'),
                },
                expect.any(Function)
            );
        });

        it('returns error response if request is unsuccessful when passing shipping address', async () => {
            client.loadInstrumentsWithAddress = jest.fn((_, callback) => callback(
                getPaymentResponse(getErrorInstrumentResponseBody(), {}, 400, 'Bad Request')
            ));

            try {
                await instrumentRequestSender.loadInstruments(requestContext, shippingAddress);
            } catch (error) {
                expect(error)
                    .toEqual(getResponse(getErrorInstrumentResponseBody(), {}, 400, 'Bad Request'));
            }
        });
    });

    describe('#deleteInstrument()', () => {
        it('deletes an instrument if request is successful', async () => {
            client.deleteShopperInstrument = jest.fn((_, callback) => callback(null,
                getPaymentResponse(deleteInstrumentResponseBody())
            ));

            const instrumentId = '123';
            const response = await instrumentRequestSender.deleteInstrument(requestContext, instrumentId);

            expect(response).toEqual(getResponse(deleteInstrumentResponseBody()));
            expect(client.deleteShopperInstrument).toHaveBeenCalledWith({
                ...requestContext,
                instrumentId,
            }, expect.any(Function));
        });

        it('returns error response if request is unsuccessful', async () => {
            client.deleteShopperInstrument = jest.fn((_, callback) => callback(
                getPaymentResponse(getErrorInstrumentResponseBody(), {}, 400, 'Bad Request')
            ));

            try {
                await instrumentRequestSender.deleteInstrument(requestContext, '');
            } catch (error) {
                expect(error)
                    .toEqual(getResponse(getErrorInstrumentResponseBody(), {}, 400, 'Bad Request'));
            }
        });
    });
});
