import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable, of } from 'rxjs';

import { CheckoutRequestSender, CheckoutStore, createCheckoutStore } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    NotInitializedError,
} from '../../../common/error/errors';
import { getGuestCustomer } from '../../../customer/customers.mock';
import { getAddressFormFields } from '../../../form/form.mock';
import {
    LoadPaymentMethodAction,
    PaymentMethod,
    PaymentMethodActionCreator,
    PaymentMethodActionType,
    PaymentMethodRequestSender,
} from '../../../payment';
import { getStripeUPE } from '../../../payment/payment-methods.mock';
import {
    DisplayName,
    StripeElement,
    StripeHostWindow,
    StripeScriptLoader,
    StripeShippingEvent,
    StripeUPEClient,
} from '../../../payment/strategies/stripe-upe';
import {
    getShippingStripeUPEJsMock,
    getShippingStripeUPEJsMockWithAnElementCreated,
    getShippingStripeUPEJsOnMock,
    getStripeUPEInitializeOptionsMockWithStyles,
    getStripeUPEShippingInitializeOptionsMock,
} from '../../../shipping/strategies/stripe-upe/stripe-upe-shipping.mock';
import ConsignmentActionCreator from '../../consignment-action-creator';
import { ConsignmentActionType } from '../../consignment-actions';
import ConsignmentRequestSender from '../../consignment-request-sender';
import { getFlatRateOption } from '../../internal-shipping-options.mock';
import { getShippingAddress } from '../../shipping-addresses.mock';
import { ShippingInitializeOptions } from '../../shipping-request-options';

import StripeUPEShippingStrategy from './stripe-upe-shipping-strategy';

describe('StripeUPEShippingStrategy', () => {
    const requestSender = createRequestSender();

    let store: CheckoutStore;
    let consignmentActionCreator: ConsignmentActionCreator;
    let strategy: StripeUPEShippingStrategy;
    let stripeScriptLoader: StripeScriptLoader;
    let stripeUPEJsMock: StripeUPEClient;
    let loadPaymentMethodAction: Observable<LoadPaymentMethodAction>;
    let paymentMethodMock: PaymentMethod;
    let paymentMethodActionCreator: PaymentMethodActionCreator;

    const stripeShippingEvent = (complete = true): StripeShippingEvent => {
        return {
            complete,
            elementType: '',
            empty: false,
            isNewAddress: true,
            phoneFieldRequired: true,
            value: {
                address: {
                    city: 'Lorem',
                    country: 'US',
                    line1: 'ok',
                    line2: 'ok',
                    postal_code: '44910',
                    state: 'TX',
                },
                firstName: 'Alan',
                lastName: 'Muñoz',
                phone: '+523333333333',
            },
            display: {
                name: DisplayName.SPLIT,
            },
        };
    };

    beforeEach(() => {
        store = createCheckoutStore();
        paymentMethodMock = { ...getStripeUPE(), clientToken: 'myToken' };
        loadPaymentMethodAction = of(
            createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, {
                methodId: `stripeupe?method=card`,
            }),
        );
        stripeScriptLoader = new StripeScriptLoader(createScriptLoader());
        consignmentActionCreator = new ConsignmentActionCreator(
            new ConsignmentRequestSender(createRequestSender()),
            new CheckoutRequestSender(createRequestSender()),
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender),
        );

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
            loadPaymentMethodAction,
        );
        paymentMethodActionCreator.loadPaymentMethod = jest.fn(() => loadPaymentMethodAction);
        stripeUPEJsMock = getShippingStripeUPEJsMock();
        jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValue(stripeUPEJsMock);

        strategy = new StripeUPEShippingStrategy(
            store,
            stripeScriptLoader,
            consignmentActionCreator,
            paymentMethodActionCreator,
        );
    });

    describe('#initialize()', () => {
        let shippingInitialization: ShippingInitializeOptions;

        beforeEach(() => {
            shippingInitialization = getStripeUPEShippingInitializeOptionsMock();
            jest.spyOn(store.getState().customer, 'getCustomerOrThrow').mockReturnValue(
                getGuestCustomer,
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                getStripeUPE(),
            );
        });

        afterEach(() => {
            delete (window as StripeHostWindow).bcStripeElements;
            jest.resetAllMocks();
        });

        it('loads a single instance of StripeUPEClient and StripeElements', async () => {
            await expect(strategy.initialize(shippingInitialization)).resolves.toBe(
                store.getState(),
            );

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(1);
        });

        it('destroys and create an instance of StripeUPEClient and StripeElements', async () => {
            stripeUPEJsMock = getShippingStripeUPEJsMockWithAnElementCreated();
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValue(stripeUPEJsMock);

            await expect(strategy.initialize(shippingInitialization)).resolves.toBe(
                store.getState(),
            );

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(1);
            expect(
                (stripeUPEJsMock.elements as jest.Mock).mock.results[0].value.getElement.mock
                    .results[0].value.destroy,
            ).toHaveBeenCalledTimes(1);
        });

        it('loads a single instance of StripeUPEClient and StripeElements when shipping data is provided', async () => {
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(
                getShippingAddress(),
            );

            await expect(strategy.initialize(shippingInitialization)).resolves.toBe(
                store.getState(),
            );

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(1);
        });

        it('does not load stripeUPE if initialization options are not provided', () => {
            const promise = strategy.initialize({ methodId: 'stripeupe' });

            expect(promise).rejects.toThrow(NotInitializedError);
        });

        it('does not load stripeUPE if UPE options are not provided', () => {
            const promise = strategy.initialize({
                methodId: 'stripeupe',
                stripeupe: {
                    methodId: '',
                    gatewayId: '',
                    onChangeShipping: jest.fn(),
                    availableCountries: 'US,MX',
                    getStripeState: jest.fn(),
                },
            });

            expect(promise).rejects.toThrow(InvalidArgumentError);
        });

        it('does not load stripeUPE when styles is provided', async () => {
            const testColor = '#123456';
            const style = {
                labelText: testColor,
                fieldText: testColor,
                fieldPlaceholderText: testColor,
                fieldErrorText: testColor,
                fieldBackground: testColor,
                fieldInnerShadow: testColor,
                fieldBorder: testColor,
            };

            await expect(
                strategy.initialize(getStripeUPEInitializeOptionsMockWithStyles(style)),
            ).resolves.toBe(store.getState());
            expect(stripeUPEJsMock.elements).toHaveBeenNthCalledWith(1, {
                clientSecret: 'clientToken',
                appearance: {
                    rules: {
                        '.Input': {
                            borderColor: testColor,
                            boxShadow: testColor,
                            color: testColor,
                        },
                    },
                    variables: {
                        borderRadius: '4px',
                        colorBackground: testColor,
                        colorDanger: testColor,
                        colorPrimary: testColor,
                        colorText: testColor,
                        colorTextPlaceholder: testColor,
                        colorTextSecondary: testColor,
                        spacingUnit: '4px',
                    },
                },
            });
        });

        it('loads a single instance of StripeUPEClient without last name and phone fields', async () => {
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(
                getShippingAddress(),
            );

            jest.spyOn(store.getState().form, 'getShippingAddressFields').mockReturnValue([
                {
                    id: 'field_7',
                    name: 'phone',
                    custom: false,
                    label: 'Phone Number',
                    required: false,
                    default: '',
                },
            ]);
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue({
                ...getShippingAddress(),
                lastName: '',
            });

            await expect(strategy.initialize(shippingInitialization)).resolves.toBe(
                store.getState(),
            );

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(1);
        });

        it('returns an error when methodId is not present', () => {
            const promise = strategy.initialize({
                ...getStripeUPEShippingInitializeOptionsMock(),
                methodId: '',
            });

            expect(promise).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('returns an error when stripePublishableKey, or clientToken is not present', () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                ...getStripeUPE(),
                initializationData: {},
            });

            const promise = strategy.initialize(shippingInitialization);

            expect(promise).rejects.toBeInstanceOf(MissingDataError);
        });

        it('loads a single instance of StripeUPEClient without first and last name fields', async () => {
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue({
                ...getShippingAddress(),
                firstName: '',
                lastName: '',
            });

            await expect(strategy.initialize(shippingInitialization)).resolves.toBe(
                store.getState(),
            );

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(1);
        });

        it('triggers onChange event callback and mounts component', async () => {
            const stripeMockElement: StripeElement = {
                destroy: jest.fn(),
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(stripeShippingEvent(true))),
            };
            const stripeUPEJsMockWithElement = getShippingStripeUPEJsOnMock(stripeMockElement);

            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(
                getShippingAddress(),
            );
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValueOnce(
                stripeUPEJsMockWithElement,
            );
            jest.useFakeTimers();

            await expect(strategy.initialize(shippingInitialization)).resolves.toBe(
                store.getState(),
            );

            jest.runAllTimers();

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeMockElement.on).toHaveBeenCalledTimes(1);
            expect(stripeMockElement.mount).toHaveBeenCalledWith(expect.any(String));
            expect(shippingInitialization.stripeupe?.onChangeShipping).toHaveBeenCalledTimes(1);
        });

        it('triggers onChange event callback and mounts component when event is not completed', async () => {
            const stripeMockElement: StripeElement = {
                destroy: jest.fn(),
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(stripeShippingEvent(false))),
            };
            const stripeUPEJsMockWithElement = getShippingStripeUPEJsOnMock(stripeMockElement);

            jest.spyOn(store.getState().form, 'getShippingAddressFields').mockReturnValue(
                getAddressFormFields(),
            );
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue({
                ...getShippingAddress(),
                countryCode: '',
            });
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValueOnce(
                stripeUPEJsMockWithElement,
            );
            jest.useFakeTimers();

            await expect(strategy.initialize(shippingInitialization)).resolves.toBe(
                store.getState(),
            );

            jest.runAllTimers();

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeMockElement.on).toHaveBeenCalledTimes(1);
            expect(stripeMockElement.mount).toHaveBeenCalledWith(expect.any(String));
            expect(shippingInitialization.stripeupe?.onChangeShipping).toHaveBeenCalledTimes(1);
        });

        it('triggers onChange event callback and throws error if event data is missing', async () => {
            const missingShippingEvent = (): StripeShippingEvent => {
                return {
                    complete: false,
                    elementType: '',
                    empty: false,
                    phoneFieldRequired: false,
                    value: {
                        address: {
                            city: '',
                            country: '',
                            line1: '',
                            line2: '',
                            postal_code: '',
                            state: '',
                        },
                        name: '',
                        phone: '',
                    },
                };
            };
            const stripeMockElement: StripeElement = {
                destroy: jest.fn(),
                mount: jest.fn(),
                unmount: jest.fn(),
                on: jest.fn((_, callback) => callback(missingShippingEvent)),
            };

            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValueOnce(
                getShippingStripeUPEJsOnMock(stripeMockElement),
            );

            const promise = strategy.initialize(shippingInitialization);

            await expect(promise).rejects.toBeInstanceOf(MissingDataError);
        });
    });

    describe('#deinitialize()', () => {
        let shippingInitialization: ShippingInitializeOptions;

        beforeEach(() => {
            shippingInitialization = getStripeUPEShippingInitializeOptionsMock();
            jest.spyOn(store.getState().customer, 'getCustomerOrThrow').mockReturnValue(
                getGuestCustomer,
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                getStripeUPE(),
            );
            strategy.initialize(shippingInitialization);
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        it('deinitializes strategy', async () => {
            await strategy.deinitialize();

            expect(await strategy.deinitialize()).toEqual(store.getState());
        });
    });

    it('updates shipping address', async () => {
        const address = getShippingAddress();
        const options = {};
        const action = of(createAction(ConsignmentActionType.CreateConsignmentsRequested));

        jest.spyOn(consignmentActionCreator, 'updateAddress').mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.updateAddress(address, options);

        expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith(address, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    it('selects shipping option', async () => {
        const method = getFlatRateOption();
        const options = {};
        const action = of(createAction(ConsignmentActionType.UpdateConsignmentRequested));

        jest.spyOn(consignmentActionCreator, 'selectShippingOption').mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.selectOption(method.id, options);

        expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalledWith(
            method.id,
            options,
        );
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });
});
