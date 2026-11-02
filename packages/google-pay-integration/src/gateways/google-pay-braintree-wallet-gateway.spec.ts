import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeGooglePayment,
    BraintreeHeadlessSDKVersionManager,
    BraintreeScriptLoader,
    BraintreeSdk,
    getBraintreePaymentDataRequest,
    getGooglePaymentMock,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    InvalidArgumentError,
    MissingDataError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import getCardDataResponse from '../mocks/google-pay-card-data-response.mock';
import { getBraintree } from '../mocks/google-pay-payment-method.mock';
import { GooglePayCardDataResponse, TotalPriceStatusType } from '../types';

import GooglePayBraintreeWalletGateway from './google-pay-braintree-wallet-gateway';

describe('GooglePayBraintreeWalletGateway', () => {
    let braintreeSdk: BraintreeSdk;
    let braintreeGooglePayment: BraintreeGooglePayment;
    let gateway: GooglePayBraintreeWalletGateway;
    let response: GooglePayCardDataResponse;

    const merchantInfo = { merchantName: 'baz', merchantId: 'bar', authJwt: 'foobar' };
    const transactionInfo = {
        currencyCode: 'USD',
        totalPrice: '10.00',
        totalPriceStatus: TotalPriceStatusType.ESTIMATED,
    };

    beforeEach(() => {
        braintreeSdk = new BraintreeSdk(
            new BraintreeScriptLoader(
                getScriptLoader(),
                window,
                new BraintreeHeadlessSDKVersionManager(),
            ),
        );
        braintreeGooglePayment = getGooglePaymentMock();

        jest.spyOn(braintreeSdk, 'initialize').mockImplementation(jest.fn());
        jest.spyOn(braintreeSdk, 'deinitialize').mockResolvedValue();
        jest.spyOn(braintreeSdk, 'getBraintreeGooglePayment').mockResolvedValue(
            braintreeGooglePayment,
        );
        jest.spyOn(braintreeSdk, 'getDataCollectorOrThrow').mockResolvedValue({
            deviceData: 'device-data',
            teardown: jest.fn(),
        });

        response = getCardDataResponse();
        response.paymentMethodData.tokenizationData.token = JSON.stringify({
            androidPayCards: [
                { nonce: 'braintree-nonce', details: { bin: '411111', isNetworkTokenized: false } },
            ],
        });

        gateway = new GooglePayBraintreeWalletGateway(braintreeSdk);
    });

    describe('#initialize()', () => {
        it('initializes braintree sdk with client token and loads google payment module', async () => {
            await gateway.initialize(getBraintree());

            expect(braintreeSdk.initialize).toHaveBeenCalledWith('token');
            expect(braintreeSdk.getBraintreeGooglePayment).toHaveBeenCalled();
        });

        it('throws an error if client token is missing', async () => {
            await expect(
                gateway.initialize({ ...getBraintree(), clientToken: undefined }),
            ).rejects.toBeInstanceOf(MissingDataError);
        });

        it('throws an error if initialization data is missing', async () => {
            await expect(
                gateway.initialize({ ...getBraintree(), initializationData: undefined }),
            ).rejects.toBeInstanceOf(MissingDataError);
        });
    });

    describe('#getPaymentGatewayParameters()', () => {
        it('returns braintree tokenization parameters', async () => {
            await gateway.initialize(getBraintree());

            const parameters = gateway.getPaymentGatewayParameters(merchantInfo, transactionInfo);

            expect(braintreeGooglePayment.createPaymentDataRequest).toHaveBeenCalledWith({
                merchantInfo,
                transactionInfo,
                cardRequirements: {
                    billingAddressRequired: true,
                    billingAddressFormat: 'FULL',
                },
            });
            expect(parameters).toEqual(
                getBraintreePaymentDataRequest().paymentMethodTokenizationParameters.parameters,
            );
        });

        it('throws an error if gateway is not initialized', () => {
            expect(() =>
                gateway.getPaymentGatewayParameters(merchantInfo, transactionInfo),
            ).toThrow(MissingDataError);
        });
    });

    describe('#getRedirectData()', () => {
        it('returns braintree nonce, card information and device data', async () => {
            const redirectData = await gateway.getRedirectData(response);

            expect(redirectData).toEqual({
                paymentWalletData: {
                    providerId: 'googlepaybraintree',
                    providerOrderId: 'braintree-nonce',
                },
                queryParams: [
                    { key: 'payment_type', value: 'googlepay' },
                    { key: 'provider', value: 'googlepaybraintree' },
                    { key: 'nonce', value: 'braintree-nonce' },
                    {
                        key: 'card_information',
                        value: JSON.stringify({
                            type: 'VISA',
                            number: '1111',
                            bin: '411111',
                            isNetworkTokenized: false,
                        }),
                    },
                    { key: 'device_data', value: 'device-data' },
                ],
            });
        });

        it('omits device data if it is not available', async () => {
            jest.spyOn(braintreeSdk, 'getDataCollectorOrThrow').mockResolvedValue({
                deviceData: undefined,
                teardown: jest.fn(),
            });

            const { queryParams } = await gateway.getRedirectData(response);

            expect(queryParams.map(({ key }) => key)).not.toContain('device_data');
        });

        it('throws an error if token cannot be parsed', async () => {
            response.paymentMethodData.tokenizationData.token = 'not-a-json';

            await expect(gateway.getRedirectData(response)).rejects.toBeInstanceOf(
                InvalidArgumentError,
            );
        });

        it('throws an error if token is not a braintree token', async () => {
            response.paymentMethodData.tokenizationData.token = JSON.stringify({ foo: 'bar' });

            await expect(gateway.getRedirectData(response)).rejects.toBeInstanceOf(
                MissingDataError,
            );
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes braintree sdk', async () => {
            await gateway.deinitialize();

            expect(braintreeSdk.deinitialize).toHaveBeenCalled();
        });
    });
});
