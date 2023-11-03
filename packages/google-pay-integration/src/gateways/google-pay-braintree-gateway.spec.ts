import {
    BraintreeClient,
    BraintreeHostWindow,
    BraintreeIntegrationService,
    BraintreeModuleCreator,
    BraintreeScriptLoader,
    BraintreeThreeDSecure,
    getClientMock,
    getGooglePayMock,
    getModuleCreatorMock,
    getThreeDSecureMock,
    GooglePayBraintreeSDK,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    InvalidArgumentError,
    MissingDataError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import getCardDataResponse from '../mocks/google-pay-card-data-response.mock';
import { getBraintree } from '../mocks/google-pay-payment-method.mock';

import GooglePayBraintreeGateway from './google-pay-braintree-gateway';
import GooglePayGateway from './google-pay-gateway';

describe('GooglePayBraintreeGateway', () => {
    let googlePayBraintreeGateway: GooglePayBraintreeGateway;
    let paymentIntegrationService: PaymentIntegrationService;
    let braintreeHostWindowMock: BraintreeHostWindow;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let braintreeIntegrationService: BraintreeIntegrationService;
    let googlePayCreatorMock: BraintreeModuleCreator<GooglePayBraintreeSDK>;
    let threeDSecureCreatorMock: BraintreeModuleCreator<BraintreeThreeDSecure>;
    let clientCreatorMock: BraintreeModuleCreator<BraintreeClient>;

    const token =
        '{"androidPayCards":[{"type":"AndroidPayCard","nonce":"12345678-1234-1234-1515-123412341234","description":"Android Pay","consumed":false,"threeDSecureInfo":null,"details":{"bin":"401288","cardType":"Visa","isNetworkTokenized":false,"lastTwo":"11","lastFour":"1111"},"binData":{"prepaid":"No","healthcare":"Unknown","debit":"Unknown","durbinRegulated":"Unknown","commercial":"Unknown","payroll":"Unknown","issuingBank":"Unknown","countryOfIssuance":"Unknown","productId":"Unknown"}}]}';

    beforeEach(() => {
        jest.spyOn(GooglePayGateway.prototype, 'getNonce').mockResolvedValueOnce('token');

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeHostWindowMock = window as BraintreeHostWindow;
        braintreeScriptLoader = {} as BraintreeScriptLoader;
        braintreeScriptLoader.initialize = jest.fn();

        clientCreatorMock = getModuleCreatorMock(getClientMock());

        googlePayCreatorMock = getModuleCreatorMock(getGooglePayMock());

        const threeDSecureMock = getThreeDSecureMock();

        jest.spyOn(threeDSecureMock, 'verifyCard').mockReturnValue(
            Promise.resolve({ nonce: 'verification_nonce' }),
        );

        threeDSecureCreatorMock = getModuleCreatorMock(threeDSecureMock);

        braintreeScriptLoader.loadClient = jest.fn().mockReturnValue(clientCreatorMock);

        braintreeScriptLoader.loadGooglePayment = jest.fn().mockReturnValue(googlePayCreatorMock);

        braintreeScriptLoader.load3DS = jest.fn().mockReturnValue(threeDSecureCreatorMock);

        braintreeIntegrationService = new BraintreeIntegrationService(
            braintreeScriptLoader,
            braintreeHostWindowMock,
        );

        jest.spyOn(braintreeIntegrationService, 'initialize');
        jest.spyOn(braintreeIntegrationService, 'get3DS');

        googlePayBraintreeGateway = new GooglePayBraintreeGateway(
            paymentIntegrationService,
            braintreeIntegrationService,
        );
    });

    it('is a special type of GooglePayGateway', () => {
        expect(googlePayBraintreeGateway).toBeInstanceOf(GooglePayGateway);
    });

    describe('#initialize', () => {
        it('should initialize successfully', async () => {
            await googlePayBraintreeGateway.initialize(getBraintree);

            expect(braintreeIntegrationService.initialize).toHaveBeenCalled();
        });

        it('throw error if do not have clientToken', async () => {
            const braintree = getBraintree();

            braintree.clientToken = '';

            await expect(googlePayBraintreeGateway.initialize(() => braintree)).rejects.toThrow(
                MissingDataError,
            );
        });
    });

    describe('#mapToExternalCheckoutData', () => {
        it('should map response to external checkout data', async () => {
            const mockResponse = {
                nonce: '12345678-1234-1234-1515-123412341234',
                card_information: {
                    number: '1111',
                    type: 'VISA',
                    bin: '401288',
                },
            };

            const dataResponse = getCardDataResponse();

            dataResponse.paymentMethodData.tokenizationData.token = token;

            await googlePayBraintreeGateway.initialize(getBraintree);

            const mappedData = await googlePayBraintreeGateway.mapToExternalCheckoutData(
                dataResponse,
            );

            expect(mappedData).toStrictEqual(mockResponse);
        });

        it('nonce is not valid JSON', async () => {
            const response = getCardDataResponse();

            response.paymentMethodData.tokenizationData.token = 'm4lf0rm3d j50n';

            const mapData = googlePayBraintreeGateway.mapToExternalCheckoutData(response);

            await expect(mapData).rejects.toThrow(InvalidArgumentError);
        });

        it('nonce is in the wrong format', async () => {
            const response = getCardDataResponse();

            response.paymentMethodData.tokenizationData.token = '{"cards":[{"nonce": "nonce"}]}';

            const mapData = googlePayBraintreeGateway.mapToExternalCheckoutData(response);

            await expect(mapData).rejects.toThrow(MissingDataError);
        });
    });

    describe('#getNonce', () => {
        it('get nonce when 3DSecure is enabled', async () => {
            const braintree = getBraintree();

            braintree.initializationData!.isThreeDSecureEnabled = true;
            braintree.initializationData!.card_information = {
                type: 'type',
                number: '1234',
                bin: 'bin',
            };

            await googlePayBraintreeGateway.initialize(() => braintree);

            const nonce = await googlePayBraintreeGateway.getNonce('googlepaybraintree');

            expect(braintreeIntegrationService.get3DS).toHaveBeenCalled();
            expect(nonce).toBe('verification_nonce');
        });

        it('get nonce when 3DSecure is not enabled', async () => {
            const braintree = getBraintree();

            braintree.initializationData!.card_information = {
                type: 'type',
                number: '1234',
                bin: 'bin',
            };

            await googlePayBraintreeGateway.initialize(() => braintree);

            const nonce = await googlePayBraintreeGateway.getNonce('googlepaybraintree');

            expect(braintreeIntegrationService.get3DS).not.toHaveBeenCalled();
            expect(nonce).toBe('token');
        });
    });
});
