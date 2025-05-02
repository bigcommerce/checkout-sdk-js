import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import {
    BuyNowCartCreationError,
    Cart,
    Consignment,
    MissingDataError,
    PaymentIntegrationService,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getBuyNowCart,
    getBuyNowCartRequestBody,
    getCart,
    getConsignment,
    getShippingOption,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceIntegrationService from './big-commerce-integration-service';
import BigCommerceRequestSender from './big-commerce-request-sender';
import BigCommerceScriptLoader from './big-commerce-script-loader';
import {
    BigCommerceOrderStatus,
    BigCommerceSDK,
    StyleButtonColor,
    StyleButtonLabel,
    StyleButtonShape,
} from './big-commerce-types';
import {
    getBigCommerceOrderDetails,
    getBigCommercePaymentMethod,
    getBigCommerceSDKMock,
    getBillingAddressFromOrderDetails,
    getShippingAddressFromOrderDetails,
} from './mocks';

describe('BigCommerceIntegrationService', () => {
    let buyNowCart: Cart;
    let cart: Cart;
    let consignments: Consignment[];
    let formPoster: FormPoster;
    let requestSender: RequestSender;
    let subject: BigCommerceIntegrationService;
    let paymentIntegrationService: PaymentIntegrationService;
    let paymentMethod: PaymentMethod;
    let bigCommerceRequestSender: BigCommerceRequestSender;
    let bigCommerceScriptLoader: BigCommerceScriptLoader;
    let bigcommerceSdk: BigCommerceSDK;

    const defaultMethodId = 'bigcommerce';
    const defaultGatewayId = 'bigcommerce_payments_apms';
    const mockedOrderId = 'order123';

    beforeEach(() => {
        buyNowCart = getBuyNowCart();
        cart = getCart();
        consignments = [getConsignment()];

        paymentMethod = getBigCommercePaymentMethod();
        bigcommerceSdk = getBigCommerceSDKMock();

        formPoster = createFormPoster();
        requestSender = createRequestSender();
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        bigCommerceRequestSender = new BigCommerceRequestSender(requestSender);
        bigCommerceScriptLoader = new BigCommerceScriptLoader(getScriptLoader());

        subject = new BigCommerceIntegrationService(
            formPoster,
            paymentIntegrationService,
            bigCommerceRequestSender,
            bigCommerceScriptLoader,
        );

        const state = paymentIntegrationService.getState();

        jest.spyOn(state, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethod);
        jest.spyOn(state, 'getCartOrThrow').mockReturnValue(cart);
        jest.spyOn(state, 'getConsignmentsOrThrow').mockReturnValue(consignments);

        jest.spyOn(bigCommerceScriptLoader, 'getBigCommerceSDK').mockResolvedValue(bigcommerceSdk);
    });

    it('creates an instance of the BigCommerceIntegrationService class', () => {
        expect(subject).toBeInstanceOf(BigCommerceIntegrationService);
    });

    describe('#loadBigCommerceSdk', () => {
        it('loads bigcommerce sdk', async () => {
            const output = await subject.loadBigCommerceSdk(
                defaultMethodId,
                undefined,
                false,
                false,
            );

            expect(bigCommerceScriptLoader.getBigCommerceSDK).toHaveBeenCalledWith(
                paymentMethod,
                cart.currency.code,
                false,
                false,
            );
            expect(output).toBe(bigcommerceSdk);
        });

        it('loads bigcommerce sdk with provided currency code', async () => {
            const providedCurrencyCode = 'UAH';
            const output = await subject.loadBigCommerceSdk(
                defaultMethodId,
                providedCurrencyCode,
                false,
                false,
            );

            expect(bigCommerceScriptLoader.getBigCommerceSDK).toHaveBeenCalledWith(
                paymentMethod,
                providedCurrencyCode,
                false,
                false,
            );
            expect(output).toBe(bigcommerceSdk);
        });
    });

    describe('#getBigCommerceSdkOrThrow', () => {
        it('returns bigcommerce sdk if it was loaded earlier', async () => {
            await subject.loadBigCommerceSdk(defaultMethodId, undefined, false);

            const output = subject.getBigCommerceSdkOrThrow();

            expect(output).toBe(bigcommerceSdk);
        });

        it('throws an error if bigcommerce sdk is not defined', () => {
            try {
                subject.getBigCommerceSdkOrThrow();
            } catch (error) {
                expect(error).toBeInstanceOf(PaymentMethodClientUnavailableError);
            }
        });
    });

    describe('#createBuyNowCartOrThrow', () => {
        it('throws an error there is no cart request body by calling callback from buyNowInitializeOptions', async () => {
            const buyNowInitializeOptionsMock = {
                getBuyNowCartRequestBody: jest.fn(),
            };

            try {
                await subject.createBuyNowCartOrThrow(buyNowInitializeOptionsMock);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('successfully creates buy now cart', async () => {
            jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockResolvedValue(buyNowCart);

            const output = await subject.createBuyNowCartOrThrow({
                getBuyNowCartRequestBody,
            });

            expect(output).toBe(buyNowCart);
        });

        it('throws an error if there is something went wrong during buy now cart creation process', async () => {
            jest.spyOn(paymentIntegrationService, 'createBuyNowCart').mockImplementation(() =>
                Promise.reject(new Error()),
            );

            try {
                await subject.createBuyNowCartOrThrow({
                    getBuyNowCartRequestBody,
                });
            } catch (error) {
                expect(error).toBeInstanceOf(BuyNowCartCreationError);
            }
        });
    });

    describe('#createOrder', () => {
        it('successfully creates bigcommerce order', async () => {
            jest.spyOn(bigCommerceRequestSender, 'createOrder').mockResolvedValue({
                orderId: mockedOrderId,
                approveUrl: 'url.com',
            });

            const output = await subject.createOrder(defaultMethodId);

            expect(bigCommerceRequestSender.createOrder).toHaveBeenCalledWith(defaultMethodId, {
                cartId: cart.id,
            });
            expect(output).toBe(mockedOrderId);
        });

        it('successfully creates bigcommerce order with provided instrument data', async () => {
            jest.spyOn(bigCommerceRequestSender, 'createOrder').mockResolvedValue({
                orderId: mockedOrderId,
                approveUrl: 'url.com',
            });

            const vaultedInstrumentData = { instrumentId: 'vaultedInstrumentIdMock' };

            const output = await subject.createOrder(defaultMethodId, vaultedInstrumentData);

            expect(bigCommerceRequestSender.createOrder).toHaveBeenCalledWith(defaultMethodId, {
                cartId: cart.id,
                instrumentId: vaultedInstrumentData.instrumentId,
            });
            expect(output).toBe(mockedOrderId);
        });
    });

    describe('#updateOrder', () => {
        it('successfully updates order', async () => {
            jest.spyOn(bigCommerceRequestSender, 'updateOrder').mockResolvedValue({
                statusCode: 200,
            });

            await subject.updateOrder();

            expect(bigCommerceRequestSender.updateOrder).toHaveBeenCalledWith({
                availableShippingOptions: consignments[0].availableShippingOptions,
                cartId: cart.id,
                selectedShippingOption: consignments[0].selectedShippingOption,
            });
        });

        it('throws an error if something went wrong during order update process', async () => {
            jest.spyOn(bigCommerceRequestSender, 'updateOrder').mockImplementation(() =>
                Promise.reject(new Error()),
            );

            try {
                await subject.updateOrder();
            } catch (error) {
                expect(error).toBeInstanceOf(RequestError);
            }
        });
    });

    describe('#getOrderStatus', () => {
        it('successfully updates order', async () => {
            jest.spyOn(bigCommerceRequestSender, 'getOrderStatus').mockResolvedValue({
                status: BigCommerceOrderStatus.Approved,
            });

            await subject.getOrderStatus();

            expect(bigCommerceRequestSender.getOrderStatus).toHaveBeenCalled();
        });

        it('calls getOrderStatus with proper data', async () => {
            jest.spyOn(bigCommerceRequestSender, 'getOrderStatus').mockResolvedValue({
                status: BigCommerceOrderStatus.Approved,
            });

            await subject.getOrderStatus('bigcommerce_payments_apms', {
                params: { useMetaData: true },
            });

            expect(bigCommerceRequestSender.getOrderStatus).toHaveBeenCalledWith(
                'bigcommerce_payments_apms',
                {
                    params: {
                        useMetaData: true,
                    },
                },
            );
        });

        it('throws an error if something went wrong during requesting order status', async () => {
            jest.spyOn(bigCommerceRequestSender, 'getOrderStatus').mockImplementation(() =>
                Promise.reject(new Error()),
            );

            try {
                await subject.getOrderStatus();
            } catch (error) {
                expect(error).toBeInstanceOf(RequestError);
            }
        });
    });

    describe('#tokenizePayment', () => {
        beforeEach(() => {
            jest.spyOn(formPoster, 'postForm').mockImplementation(jest.fn);
        });

        it('throws an error if order id is not provided', () => {
            try {
                subject.tokenizePayment(defaultMethodId);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('successfully posts the form data', () => {
            subject.tokenizePayment(defaultMethodId, mockedOrderId);

            expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', {
                payment_type: 'bigcommerce',
                action: 'set_external_checkout',
                provider: defaultMethodId,
                order_id: mockedOrderId,
            });
        });

        it('successfully posts the form data with buy now cart id', () => {
            jest.spyOn(paymentIntegrationService.getState(), 'getCartOrThrow').mockReturnValue(
                buyNowCart,
            );

            subject.tokenizePayment(defaultMethodId, mockedOrderId);

            expect(formPoster.postForm).toHaveBeenCalledWith('/checkout.php', {
                payment_type: 'bigcommerce',
                action: 'set_external_checkout',
                provider: defaultMethodId,
                order_id: mockedOrderId,
                cart_id: buyNowCart.id,
            });
        });
    });

    describe('#submitPayment', () => {
        it('successfully submits payment', async () => {
            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(jest.fn());

            const paymentDataMock = {
                formattedPayload: {
                    vault_payment_instrument: null,
                    set_as_default_stored_instrument: null,
                    device_info: null,
                    method_id: defaultMethodId,
                    //TODO: double check if this is correct
                    paypal_account: {
                        order_id: mockedOrderId,
                    },
                },
            };

            await subject.submitPayment(defaultMethodId, mockedOrderId);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: defaultMethodId,
                paymentData: paymentDataMock,
            });
        });

        it('successfully submits payment with provided gateway', async () => {
            jest.spyOn(paymentIntegrationService, 'submitPayment').mockImplementation(jest.fn());

            const paymentDataMock = {
                formattedPayload: {
                    vault_payment_instrument: null,
                    set_as_default_stored_instrument: null,
                    device_info: null,
                    method_id: defaultMethodId,
                    //TODO: double check if this is correct
                    paypal_account: {
                        order_id: mockedOrderId,
                    },
                },
            };

            await subject.submitPayment(defaultMethodId, mockedOrderId, defaultGatewayId);

            expect(paymentIntegrationService.submitPayment).toHaveBeenCalledWith({
                methodId: defaultMethodId,
                paymentData: paymentDataMock,
                gatewayId: defaultGatewayId,
            });
        });
    });

    describe('#getShippingOptionOrThrow', () => {
        it('returns selected shipping option', () => {
            const consignment = getConsignment();

            jest.spyOn(
                paymentIntegrationService.getState(),
                'getConsignmentsOrThrow',
            ).mockReturnValue([consignment]);

            const output = subject.getShippingOptionOrThrow(consignment.selectedShippingOption?.id);

            expect(output).toStrictEqual(consignment.selectedShippingOption || {});
        });

        it('returns recommended shipping option if there is no selected ones', () => {
            const recommendedShippingOption = {
                ...getShippingOption(),
                isRecommended: true,
            };

            const consignment = {
                ...getConsignment(),
                availableShippingOptions: [recommendedShippingOption],
                selectedShippingOption: {
                    additionalDescription: 'string',
                    description: 'string',
                    id: 'string',
                    isRecommended: true,
                    imageUrl: 'string',
                    cost: 12,
                    transitTime: 'string',
                    type: 'string',
                },
            };

            const updatedConsignment = {
                ...consignment,
                selectedShippingOption: recommendedShippingOption,
            };

            jest.spyOn(paymentIntegrationService.getState(), 'getConsignmentsOrThrow')
                .mockReturnValueOnce([consignment])
                .mockReturnValue([updatedConsignment]);

            const output = subject.getShippingOptionOrThrow();

            expect(output).toBe(recommendedShippingOption);
        });

        it('returns first available shipping option if there is no recommended or selected options', () => {
            const firstShippingOption = {
                ...getShippingOption(),
                id: '1',
            };

            const secondShippingOption = {
                ...getShippingOption(),
                id: '2',
            };

            const consignment = {
                ...getConsignment(),
                availableShippingOptions: [firstShippingOption, secondShippingOption],
                selectedShippingOption: {
                    additionalDescription: 'string',
                    description: 'string',
                    id: '111',
                    isRecommended: true,
                    imageUrl: 'string',
                    cost: 12,
                    transitTime: 'string',
                    type: 'string',
                },
            };

            const updatedConsignment = {
                ...consignment,
                selectedShippingOption: firstShippingOption,
            };

            jest.spyOn(paymentIntegrationService.getState(), 'getConsignmentsOrThrow')
                .mockReturnValueOnce([consignment])
                .mockReturnValue([updatedConsignment]);

            const output = subject.getShippingOptionOrThrow();

            expect(output).toBe(firstShippingOption);
        });
    });

    describe('#getAddress', () => {
        it('successfully returns valid address', () => {
            const bigCommerceOrderDetails = getBigCommerceOrderDetails();
            const address = {
                firstName: bigCommerceOrderDetails.payer.name.given_name,
                lastName: bigCommerceOrderDetails.payer.name.surname,
                email: bigCommerceOrderDetails.payer.email_address,
                phone: '',
                company: '',
                address1: bigCommerceOrderDetails.payer.address.address_line_1,
                address2: '',
                city: bigCommerceOrderDetails.payer.address.admin_area_2,
                countryCode: bigCommerceOrderDetails.payer.address.country_code,
                postalCode: bigCommerceOrderDetails.payer.address.postal_code,
                stateOrProvince: '',
                stateOrProvinceCode: bigCommerceOrderDetails.payer.address.admin_area_1,
                customFields: [],
            };

            const output = subject.getAddress(address);

            expect(output).toStrictEqual({
                firstName: bigCommerceOrderDetails.payer.name.given_name,
                lastName: bigCommerceOrderDetails.payer.name.surname,
                email: bigCommerceOrderDetails.payer.email_address,
                phone: '',
                company: '',
                address1: bigCommerceOrderDetails.payer.address.address_line_1,
                address2: '',
                city: bigCommerceOrderDetails.payer.address.admin_area_2,
                countryCode: bigCommerceOrderDetails.payer.address.country_code,
                postalCode: bigCommerceOrderDetails.payer.address.postal_code,
                stateOrProvince: '',
                stateOrProvinceCode: bigCommerceOrderDetails.payer.address.admin_area_1,
                customFields: [],
            });
        });

        it('successfully returns valid address with phone number filled in', () => {
            const bigCommerceOrderDetails = getBigCommerceOrderDetails();
            const address = {
                firstName: bigCommerceOrderDetails.payer.name.given_name,
                lastName: bigCommerceOrderDetails.payer.name.surname,
                email: bigCommerceOrderDetails.payer.email_address,
                phone: '555',
                company: '',
                address1: bigCommerceOrderDetails.payer.address.address_line_1,
                address2: '',
                city: bigCommerceOrderDetails.payer.address.admin_area_2,
                countryCode: bigCommerceOrderDetails.payer.address.country_code,
                postalCode: bigCommerceOrderDetails.payer.address.postal_code,
                stateOrProvince: '',
                stateOrProvinceCode: bigCommerceOrderDetails.payer.address.admin_area_1,
                customFields: [],
            };

            const output = subject.getAddress(address);

            expect(output).toStrictEqual({
                firstName: bigCommerceOrderDetails.payer.name.given_name,
                lastName: bigCommerceOrderDetails.payer.name.surname,
                email: bigCommerceOrderDetails.payer.email_address,
                phone: '555',
                company: '',
                address1: bigCommerceOrderDetails.payer.address.address_line_1,
                address2: '',
                city: bigCommerceOrderDetails.payer.address.admin_area_2,
                countryCode: bigCommerceOrderDetails.payer.address.country_code,
                postalCode: bigCommerceOrderDetails.payer.address.postal_code,
                stateOrProvince: '',
                stateOrProvinceCode: bigCommerceOrderDetails.payer.address.admin_area_1,
                customFields: [],
            });
        });
    });

    describe('#getBillingAddressFromOrderDetails', () => {
        it('successfully returns valid billing address from the orderDetails data', () => {
            const bigCommerceOrderDetails = getBigCommerceOrderDetails();

            const output = subject.getBillingAddressFromOrderDetails(bigCommerceOrderDetails);

            expect(output).toStrictEqual(getBillingAddressFromOrderDetails());
        });

        it('successfully returns empty string in phone number', () => {
            const bigCommerceOrderDetails = {
                ...getBigCommerceOrderDetails(),
                payer: {
                    ...getBigCommerceOrderDetails().payer,
                    phone: {
                        phone_number: {
                            national_number: '',
                        },
                    },
                },
            };

            const output = subject.getBillingAddressFromOrderDetails(bigCommerceOrderDetails);

            expect(output.phone).toBe('');
        });

        it('successfully returns correct phone number', () => {
            const bigCommerceOrderDetails = {
                ...getBigCommerceOrderDetails(),
                payer: {
                    ...getBigCommerceOrderDetails().payer,
                    phone: {
                        phone_number: {
                            national_number: '555333',
                        },
                    },
                },
            };

            const output = subject.getBillingAddressFromOrderDetails(bigCommerceOrderDetails);

            expect(output.phone).toBe('555333');
        });
    });

    describe('#getShippingAddressFromOrderDetails', () => {
        it('successfully returns valid shipping address from the orderDetails data', () => {
            const bigCommerceOrderDetails = getBigCommerceOrderDetails();

            const output = subject.getShippingAddressFromOrderDetails(bigCommerceOrderDetails);

            expect(output).toStrictEqual(getShippingAddressFromOrderDetails());
        });
    });

    describe('#getValidButtonStyle', () => {
        it('returns valid button style', () => {
            const stylesMock = {
                color: StyleButtonColor.silver,
                height: 55,
                shape: StyleButtonShape.rect,
            };

            const expects = {
                ...stylesMock,
            };

            expect(subject.getValidButtonStyle(stylesMock)).toEqual(expects);
        });

        it('returns button style without shape if shape is not valid', () => {
            const stylesMock = {
                color: StyleButtonColor.silver,
                height: 55,
                shape: 'ellipse' as StyleButtonShape,
            };

            const expects = {
                ...stylesMock,
                shape: undefined,
            };

            expect(subject.getValidButtonStyle(stylesMock)).toEqual(expects);
        });

        it('returns button style without color if color is not valid', () => {
            const stylesMock = {
                color: 'red' as StyleButtonColor,
                height: 55,
            };

            const expects = {
                ...stylesMock,
                color: undefined,
            };

            expect(subject.getValidButtonStyle(stylesMock)).toEqual(expects);
        });

        it('returns button style without label if label is not valid', () => {
            const stylesMock = {
                height: 55,
                label: 'label' as StyleButtonLabel,
            };

            const expects = {
                ...stylesMock,
                label: undefined,
            };

            expect(subject.getValidButtonStyle(stylesMock)).toEqual(expects);
        });

        it('returns styles with updated height if height value is bigger than expected', () => {
            const stylesMock = {
                color: StyleButtonColor.silver,
                height: 110,
                shape: StyleButtonShape.rect,
            };

            const expects = {
                ...stylesMock,
                height: 55,
            };

            expect(subject.getValidButtonStyle(stylesMock)).toEqual(expects);
        });

        it('returns styles with updated height if height value is less than expected', () => {
            const stylesMock = {
                color: StyleButtonColor.silver,
                height: 10,
                shape: StyleButtonShape.rect,
            };

            const expects = {
                ...stylesMock,
                height: 25,
            };

            expect(subject.getValidButtonStyle(stylesMock)).toEqual(expects);
        });

        it('returns styles with default height if height value not provided', () => {
            const stylesMock = {
                color: StyleButtonColor.silver,
                height: undefined,
                shape: StyleButtonShape.rect,
            };

            const expects = {
                ...stylesMock,
                height: 40,
            };

            expect(subject.getValidButtonStyle(stylesMock)).toEqual(expects);
        });
    });

    describe('#removeElement', () => {
        it('removed element from dom', () => {
            const bigCommerceButtonContainerId = 'bigCommerceButtonContainer';

            const bigCommerceButtonElement = document.createElement('div');

            bigCommerceButtonElement.id = bigCommerceButtonContainerId;

            document.body.appendChild(bigCommerceButtonElement);

            const element = document.getElementById(bigCommerceButtonContainerId);

            expect(element).toBeDefined();

            subject.removeElement(bigCommerceButtonContainerId);

            const computedStyle = getComputedStyle(element as Element);

            expect(computedStyle.getPropertyValue('display')).toBe('none');
        });
    });
});
