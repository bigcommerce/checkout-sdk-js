import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BraintreeDataCollector,
    BraintreeHostWindow,
    BraintreeScriptLoader,
    BraintreeSdk,
    BraintreeVisaCheckout,
    getBraintree,
    getDataCollectorMock,
    getDeviceDataMock,
    getVisaCheckoutMock,
    VisaCheckoutHostWindow,
    VisaCheckoutSDK,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import {
    CheckoutButtonInitializeOptions,
    MissingDataError,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { getVisaCheckoutSDKMock } from '../mocks/braintree-visa-checkout.mock';

import BraintreeVisaCheckoutButtonStrategy from './braintree-visa-checkout-button-strategy';
import VisaCheckoutScriptLoader from './visa-checkout-script-loader';

describe('BraintreeVisaCheckoutButtonStrategy', () => {
    let strategy: BraintreeVisaCheckoutButtonStrategy;
    let paymentIntegrationService: PaymentIntegrationService;
    let braintreeSdk: BraintreeSdk;
    let braintreeScriptLoader: BraintreeScriptLoader;
    let formPoster: FormPoster;
    let visaCheckoutScriptLoader: VisaCheckoutScriptLoader;
    let paymentMethodMock: PaymentMethod;
    let braintreeVisaCheckout: BraintreeVisaCheckout;
    let mockWindow: VisaCheckoutHostWindow;
    let visaCheckoutSDKMock: VisaCheckoutSDK;
    let braintreeVisaCheckoutButtonElement: HTMLDivElement;
    let dataCollector: BraintreeDataCollector;

    const defaultContainerId = 'braintree-visa-checkout-button-mock-id';

    const initializationOptions: CheckoutButtonInitializeOptions = {
        methodId: 'braintreevisacheckout',
        containerId: 'braintree-visa-checkout-button-mock-id',
    };

    beforeEach(() => {
        mockWindow = {} as VisaCheckoutHostWindow & BraintreeHostWindow;

        dataCollector = getDataCollectorMock();

        visaCheckoutSDKMock = getVisaCheckoutSDKMock();

        paymentMethodMock = {
            ...getBraintree(),
            clientToken: 'myVisaCheckoutToken',
        };

        braintreeVisaCheckoutButtonElement = document.createElement('div');
        braintreeVisaCheckoutButtonElement.id = defaultContainerId;
        document.body.appendChild(braintreeVisaCheckoutButtonElement);

        braintreeVisaCheckout = getVisaCheckoutMock();

        paymentIntegrationService = new PaymentIntegrationServiceMock();
        formPoster = createFormPoster();

        braintreeScriptLoader = new BraintreeScriptLoader(getScriptLoader(), mockWindow);
        braintreeSdk = new BraintreeSdk(braintreeScriptLoader);

        visaCheckoutScriptLoader = new VisaCheckoutScriptLoader(getScriptLoader(), mockWindow);

        strategy = new BraintreeVisaCheckoutButtonStrategy(
            paymentIntegrationService,
            formPoster,
            braintreeSdk,
            visaCheckoutScriptLoader,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getPaymentMethodOrThrow').mockReturnValue(
            paymentMethodMock,
        );

        jest.spyOn(braintreeSdk, 'initialize');
        jest.spyOn(braintreeSdk, 'getBraintreeVisaCheckout').mockReturnValue(braintreeVisaCheckout);
        jest.spyOn(braintreeSdk, 'getDataCollectorOrThrow').mockReturnValue(dataCollector);

        jest.spyOn(visaCheckoutScriptLoader, 'load').mockImplementation(() => {
            mockWindow.V = visaCheckoutSDKMock;

            return mockWindow.V;
        });

        jest.spyOn(formPoster, 'postForm').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('#initialize()', () => {
        it('renders visa checkout button', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreeVisaCheckout.createInitOptions).toHaveBeenCalled();
            expect(mockWindow.V?.init).toHaveBeenCalled();
        });

        it('do not render the visa button if there is no element with the containerId identifier in the DOM', async () => {
            try {
                await strategy.initialize({
                    ...initializationOptions,
                    containerId: 'test-container',
                });
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe('Need a container to place the button');
            }
        });

        it('throws error if client token is missing', async () => {
            paymentMethodMock.clientToken = undefined;

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws error if initialization data is missing', async () => {
            paymentMethodMock.initializationData = undefined;

            try {
                await strategy.initialize(initializationOptions);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('initializes braintree integration service', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreeSdk.initialize).toHaveBeenCalledWith(
                paymentMethodMock.clientToken,
                paymentIntegrationService.getState().getStoreConfig(),
            );
        });

        it('initializes braintree visa checkout', async () => {
            await strategy.initialize(initializationOptions);

            expect(braintreeSdk.getBraintreeVisaCheckout).toHaveBeenCalled();
        });

        it('call the createInitOptions and init functions with the proper options', async () => {
            const properOptions = {
                paymentRequest: {
                    currencyCode: 'USD',
                    subtotal: '190',
                },
                settings: {
                    shipping: {
                        collectShipping: true,
                    },
                },
            };

            await strategy.initialize(initializationOptions);

            expect(braintreeVisaCheckout.createInitOptions).toHaveBeenCalledWith(properOptions);
            expect(mockWindow.V?.init).toHaveBeenCalledWith(properOptions);
        });

        it('visa Checkout tokenization', async () => {
            visaCheckoutSDKMock.on = jest.fn((type, callback) => {
                return type === 'payment.success' ? callback('data') : undefined;
            });

            await strategy.initialize(initializationOptions);

            expect(braintreeVisaCheckout.tokenize).toHaveBeenCalled();
            expect(braintreeSdk.getDataCollectorOrThrow).toHaveBeenCalled();
        });

        it('posts payment details to server to set checkout data when Visa Checkout payment details are tokenized', async () => {
            const mappedToBCAddress = JSON.stringify({
                email: 'test@example.com',
                first_name: 'John',
                last_name: 'Doe',
                phone_number: '04877789875',
                address_line_1: '51 Main St.',
                address_line_2: 'Ultimo',
                city: 'Sydney',
                state: 'NSW',
                country_code: 'ES',
                postal_code: '2008',
            });

            visaCheckoutSDKMock.on = jest.fn((type, callback) => {
                return type === 'payment.success' ? callback('data') : undefined;
            });

            await strategy.initialize(initializationOptions);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(formPoster.postForm).toHaveBeenCalledWith(
                '/checkout.php',
                expect.objectContaining({
                    action: 'set_external_checkout',
                    billing_address: mappedToBCAddress,
                    card_information: JSON.stringify({ type: 'Visa', number: '11' }),
                    device_data: getDeviceDataMock(),
                    nonce: 'my-nonce',
                    payment_type: 'type1',
                    provider: 'braintreevisacheckout',
                    shipping_address: mappedToBCAddress,
                }),
            );
        });
    });
});
