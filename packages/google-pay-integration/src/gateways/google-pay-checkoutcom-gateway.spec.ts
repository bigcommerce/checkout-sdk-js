import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import {
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
    PaymentIntegrationService,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import getCardDataResponse from '../mocks/google-pay-card-data-response.mock';
import { getCheckoutCom, getGeneric } from '../mocks/google-pay-payment-method.mock';
import getThreeDSecureRequestError, {
    getGenericRequestError,
    getThreeDSecureLikeRequestError,
} from '../mocks/google-pay-threedsecure-request-error.mock';

import GooglePayCheckoutComGateway from './google-pay-checkoutcom-gateway';
import GooglePayGateway from './google-pay-gateway';

describe('GooglePayCheckoutComGateway', () => {
    let gateway: GooglePayCheckoutComGateway;
    let paymentIntegrationService: PaymentIntegrationService;
    let requestSender: RequestSender;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        requestSender = createRequestSender();
        jest.spyOn(requestSender, 'post').mockResolvedValue({ body: { token: 'tok_f00b4r' } });

        gateway = new GooglePayCheckoutComGateway(paymentIntegrationService, requestSender);
    });

    it('is a special type of GooglePayGateway', () => {
        expect(gateway).toBeInstanceOf(GooglePayGateway);
    });

    describe('#mapToExternalCheckoutData', () => {
        it('should map response to external checkout data', async () => {
            const expectedData = {
                nonce: 'tok_f00b4r',
                card_information: {
                    type: 'VISA',
                    number: '1111',
                },
            };

            await gateway.initialize(getCheckoutCom);

            const mappedData = await gateway.mapToExternalCheckoutData(getCardDataResponse());

            expect(mappedData).toStrictEqual(expectedData);
        });

        it('should tokenize the google pay payment data', async () => {
            await gateway.initialize(getCheckoutCom);
            await gateway.mapToExternalCheckoutData(getCardDataResponse());

            expect(requestSender.post).toHaveBeenCalledWith(
                'https://api.sandbox.checkout.com/tokens',
                {
                    credentials: false,
                    body: {
                        type: 'googlepay',
                        token_data: {
                            signature: 'foo',
                            protocolVersion: 'ECv1',
                            signedMessage: {
                                encryptedMessage: 'bar',
                                ephemeralPublicKey: 'baz',
                                tag: 'foobar',
                            },
                        },
                    },
                    headers: {
                        Authorization: 'pk_f00-b4r',
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': null,
                    },
                },
            );
        });

        describe('should fail if:', () => {
            test('nonce is not valid JSON', async () => {
                const response = getCardDataResponse();

                response.paymentMethodData.tokenizationData.token = 'm4lf0rm3d j50n';

                const mapData = gateway.mapToExternalCheckoutData(response);

                await expect(mapData).rejects.toThrow(InvalidArgumentError);
            });

            test('parsed nonce is not a GooglePayTokenObject', async () => {
                const response = getCardDataResponse();

                response.paymentMethodData.tokenizationData.token = '{"id":"tok_f00b4r"}';

                const mapData = gateway.mapToExternalCheckoutData(response);

                await expect(mapData).rejects.toThrow(MissingDataError);
            });

            test('not initialized', async () => {
                const mapData = gateway.mapToExternalCheckoutData(getCardDataResponse());

                await expect(mapData).rejects.toThrow(NotInitializedError);
            });

            test('initializationData is not GooglePayCheckoutComInitializationData', async () => {
                await gateway.initialize(getGeneric);

                const mapData = gateway.mapToExternalCheckoutData(getCardDataResponse());

                await expect(mapData).rejects.toThrow(MissingDataError);
            });
        });
    });

    describe('#getPaymentGatewayParameters', () => {
        it('should return payment gateway parameters', async () => {
            const expectedParams = {
                gateway: 'checkoutltd',
                gatewayMerchantId: 'pk_f00-b4r',
            };

            await gateway.initialize(getCheckoutCom);

            expect(gateway.getPaymentGatewayParameters()).toStrictEqual(expectedParams);
        });

        describe('should fail if:', () => {
            test('not initialized', () => {
                expect(() => gateway.getPaymentGatewayParameters()).toThrow(NotInitializedError);
            });

            test('initializationData is not GooglePayCheckoutComInitializationData', async () => {
                await gateway.initialize(getGeneric);

                expect(() => gateway.getPaymentGatewayParameters()).toThrow(MissingDataError);
            });
        });
    });

    describe('#processAdditionalAction', () => {
        it('should process additional action', async () => {
            const assign = jest.spyOn(window.location, 'assign').mockImplementation();

            void gateway.processAdditionalAction(getThreeDSecureRequestError());

            await new Promise((resolve) => process.nextTick(resolve));

            expect(assign).toHaveBeenCalledWith('https://foo.com');
        });

        describe('rejects the error if:', () => {
            it('is not a RequestError', async () => {
                const processError = gateway.processAdditionalAction('error');

                await expect(processError).rejects.toBe('error');
            });

            it('is not a GooglePayThreeDSecureResult', async () => {
                const processError = gateway.processAdditionalAction(getGenericRequestError());

                await expect(processError).rejects.toThrow(RequestError);
            });

            test('code is not three_d_secure_required', async () => {
                const processError = gateway.processAdditionalAction(
                    getThreeDSecureLikeRequestError(),
                );

                await expect(processError).rejects.toThrow(RequestError);
            });
        });
    });
});
