import {
    BraintreeConnect,
    BraintreeConnectWindow,
    BraintreeFastlane,
    BraintreeFastlaneWindow,
    getBraintree,
    getConnectMock,
    getFastlaneMock,
} from '@bigcommerce/checkout-sdk/braintree-utils';

import { getCart } from '../../cart/carts.mock';
import { CheckoutService, createCheckoutService } from '../../checkout';
import { getCheckoutWithCoupons } from '../../checkout/checkouts.mock';
import { getConfig } from '../../config/configs.mock';
import { getCustomer } from '../../customer/customers.mock';

import BraintreeAnalyticTracker from './braintree-analytic-tracker';
import BraintreeAnalyticTrackerService from './braintree-analytic-tracker-service';

describe('BraintreeAnalyticTracker', () => {
    let braintreeAnalyticTracker: BraintreeAnalyticTrackerService;
    let braintreeConnectMock: BraintreeConnect;
    let braintreeFastlaneMock: BraintreeFastlane;
    let braintreeWindow: Window &
        Partial<BraintreeConnectWindow> &
        Partial<BraintreeFastlaneWindow>;
    let checkoutService: CheckoutService;

    const getBraintreeAcceleratedCheckout = (
        isControlGroup: boolean,
        isFastlaneEnabled: boolean,
    ) => ({
        ...getBraintree(),
        id: 'braintreeacceleratedcheckout',
        initializationData: {
            isAcceleratedCheckoutEnabled: true,
            shouldRunAcceleratedCheckout: isControlGroup,
            isBraintreeAnalyticsV2Enabled: true,
            isFastlaneEnabled,
        },
    });

    const guestCustomer = {
        ...getCustomer(),
        isGuest: true,
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        braintreeWindow = window;
        braintreeAnalyticTracker = new BraintreeAnalyticTracker(checkoutService);

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(
            getCheckoutWithCoupons(),
        );

        jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(
            getConfig().storeConfig,
        );
    });

    describe('Braintree Connect Analytic tests', () => {
        beforeEach(() => {
            braintreeConnectMock = getConnectMock();
            braintreeWindow.braintreeConnect = braintreeConnectMock;

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
                getBraintreeAcceleratedCheckout(true, false),
            ]);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
                getBraintreeAcceleratedCheckout(false, false),
            );
        });

        afterAll(() => {
            delete braintreeWindow.braintreeConnect;
        });

        describe('customerPaymentMethodExecuted', () => {
            it('does not trigger anything if braintreeConnect is not provided', () => {
                delete braintreeWindow.braintreeConnect;

                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeConnectMock.events.emailSubmitted).not.toHaveBeenCalled();
            });

            it('does not trigger anything if braintree analytic feature is disabled', () => {
                const braintreeAcceleratedCheckoutMock = getBraintreeAcceleratedCheckout(
                    false,
                    false,
                );

                jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                    ...braintreeAcceleratedCheckoutMock,
                    initializationData: {
                        ...braintreeAcceleratedCheckoutMock.initializationData,
                        isBraintreeAnalyticsV2Enabled: false,
                    },
                });

                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeConnectMock.events.emailSubmitted).not.toHaveBeenCalled();
            });

            it('triggers emailSubmitted callback for store member', () => {
                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeConnectMock.events.emailSubmitted).toHaveBeenCalled();
            });
        });

        describe('paymentComplete', () => {
            it('does not trigger anything if braintreeConnect is not provided', () => {
                delete braintreeWindow.braintreeConnect;

                braintreeAnalyticTracker.paymentComplete();

                expect(braintreeConnectMock.events.orderPlaced).not.toHaveBeenCalled();
            });

            it('does not trigger anything if braintree analytic feature is disabled', () => {
                const braintreeAcceleratedCheckoutMock = getBraintreeAcceleratedCheckout(
                    false,
                    false,
                );

                jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                    ...braintreeAcceleratedCheckoutMock,
                    initializationData: {
                        ...braintreeAcceleratedCheckoutMock.initializationData,
                        isBraintreeAnalyticsV2Enabled: false,
                    },
                });

                braintreeAnalyticTracker.paymentComplete();

                expect(braintreeConnectMock.events.orderPlaced).not.toHaveBeenCalled();
            });

            it('triggers orderPlaced', () => {
                braintreeAnalyticTracker.paymentComplete();

                expect(braintreeConnectMock.events.orderPlaced).toHaveBeenCalled();
            });
        });

        describe('selectedPaymentMethod', () => {
            it('does not trigger anything if braintreeConnect is not provided', () => {
                delete braintreeWindow.braintreeConnect;

                braintreeAnalyticTracker.selectedPaymentMethod('applepay');

                expect(braintreeConnectMock.events.apmSelected).not.toHaveBeenCalled();
            });

            it('does not trigger anything if method id is not properly provided', () => {
                braintreeAnalyticTracker.selectedPaymentMethod('');

                expect(braintreeConnectMock.events.apmSelected).not.toHaveBeenCalled();
            });

            it('does not trigger anything if braintree analytic feature is disabled', () => {
                const braintreeAcceleratedCheckoutMock = getBraintreeAcceleratedCheckout(
                    false,
                    false,
                );

                jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                    ...braintreeAcceleratedCheckoutMock,
                    initializationData: {
                        ...braintreeAcceleratedCheckoutMock.initializationData,
                        isBraintreeAnalyticsV2Enabled: false,
                    },
                });

                braintreeAnalyticTracker.selectedPaymentMethod('applepay');

                expect(braintreeConnectMock.events.apmSelected).not.toHaveBeenCalled();
            });

            it('triggers apm selected event', () => {
                braintreeAnalyticTracker.selectedPaymentMethod('applepay');

                expect(braintreeConnectMock.events.apmSelected).toHaveBeenCalled();
            });
        });

        describe('walletButtonClick', () => {
            it('does not trigger anything if braintreeConnect is not provided', () => {
                delete braintreeWindow.braintreeConnect;

                braintreeAnalyticTracker.walletButtonClick('applepay');

                expect(braintreeConnectMock.events.apmSelected).not.toHaveBeenCalled();
            });

            it('does not trigger anything if method id is not properly provided', () => {
                braintreeAnalyticTracker.walletButtonClick('');

                expect(braintreeConnectMock.events.apmSelected).not.toHaveBeenCalled();
            });

            it('does not trigger anything if braintree analytic feature is disabled', () => {
                const braintreeAcceleratedCheckoutMock = getBraintreeAcceleratedCheckout(
                    false,
                    false,
                );

                jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                    ...braintreeAcceleratedCheckoutMock,
                    initializationData: {
                        ...braintreeAcceleratedCheckoutMock.initializationData,
                        isBraintreeAnalyticsV2Enabled: false,
                    },
                });

                braintreeAnalyticTracker.walletButtonClick('applepay');

                expect(braintreeConnectMock.events.apmSelected).not.toHaveBeenCalled();
            });

            it('triggers apm selected event', () => {
                braintreeAnalyticTracker.walletButtonClick('applepay');

                expect(braintreeConnectMock.events.apmSelected).toHaveBeenCalled();
            });
        });

        describe('#emailSubmitted callback', () => {
            const emailSubmitEventOptions = {
                apm_list: 'braintreeacceleratedcheckout',
                apm_shown: '0',
                context_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                context_type: 'cs_id',
                experiment: '[{"treatment_group":"control"}]',
                merchant_name: 's1504098821',
                page_name: '',
                page_type: 'checkout_page',
                partner_name: 'bigc',
                store_id: '1504098821',
                user_email_saved: false,
                user_type: 'store_member',
            };

            it('calls emailSubmitted callback for store member', () => {
                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeConnectMock.events.emailSubmitted).toHaveBeenCalledWith(
                    emailSubmitEventOptions,
                );
            });

            it('calls emailSubmitted callback for guest user', () => {
                jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(
                    guestCustomer,
                );

                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeConnectMock.events.emailSubmitted).toHaveBeenCalledWith({
                    ...emailSubmitEventOptions,
                    user_type: 'store_guest', // <-- this option changes based on "guest"/"store member" user
                });
            });

            it('calls emailSubmitted callback for users from control group', () => {
                jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
                    getBraintreeAcceleratedCheckout(false, false),
                ]);

                jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
                    getBraintreeAcceleratedCheckout(false, false),
                );

                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeConnectMock.events.emailSubmitted).toHaveBeenCalledWith({
                    ...emailSubmitEventOptions,
                    experiment: '[{"treatment_group":"control"}]', // <- user in test group means that BT AXO feature is not available due to A/B testing flow
                });
            });

            it('calls emailSubmitted callback for users from test group', () => {
                jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
                    getBraintreeAcceleratedCheckout(true, false),
                ]);

                jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
                    getBraintreeAcceleratedCheckout(true, false),
                );

                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeConnectMock.events.emailSubmitted).toHaveBeenCalledWith({
                    ...emailSubmitEventOptions,
                    experiment: '[{"treatment_group":"test"}]',
                });
            });

            it('calls emailSubmitted callback and place user in a control group if there was an error loading braintreeacceleratedcheckout payment method', () => {
                jest.spyOn(
                    checkoutService.getState().errors,
                    'getLoadPaymentMethodError',
                ).mockReturnValue(Error('asd'));

                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeConnectMock.events.emailSubmitted).toHaveBeenCalledWith({
                    ...emailSubmitEventOptions,
                    experiment: '[{"treatment_group":"control"}]',
                });
            });

            it('calls emailSubmitted callback with apm options', () => {
                jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
                    getBraintree(),
                    getBraintreeAcceleratedCheckout(false, false),
                ]);

                jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
                    getBraintreeAcceleratedCheckout(false, false),
                );

                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeConnectMock.events.emailSubmitted).toHaveBeenCalledWith({
                    ...emailSubmitEventOptions,
                    apm_list: 'braintree,braintreeacceleratedcheckout',
                    apm_shown: '1',
                });
            });
        });

        describe('#paymentComplete callback', () => {
            const paymentCompleteEventOptions = {
                context_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                context_type: 'cs_id',
                currency_code: 'USD', // <- related to paymentComplete callback
                experiment: '[{"treatment_group":"control"}]',
                merchant_name: 's1504098821',
                page_name: '',
                page_type: 'checkout_page',
                partner_name: 'bigc',
                selected_payment_method: 'applepay', // <- related to paymentComplete callback
                store_id: '1504098821',
                user_type: 'store_member',
            };

            it('triggers paymentComplete with provided selected method', () => {
                braintreeAnalyticTracker.selectedPaymentMethod('applepay');
                braintreeAnalyticTracker.paymentComplete();

                expect(braintreeConnectMock.events.orderPlaced).toHaveBeenCalledWith(
                    paymentCompleteEventOptions,
                );
            });

            it('triggers paymentComplete with provided with different payment method selected method', () => {
                braintreeAnalyticTracker.selectedPaymentMethod('braintreeacceleratedcheckout');
                braintreeAnalyticTracker.paymentComplete();

                expect(braintreeConnectMock.events.orderPlaced).toHaveBeenCalledWith({
                    ...paymentCompleteEventOptions,
                    selected_payment_method: 'braintreeacceleratedcheckout',
                });
            });

            it('triggers paymentComplete with provided with EUR currency code', () => {
                jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue({
                    ...getCart(),
                    currency: {
                        name: 'Euro',
                        code: 'EUR',
                        symbol: '€',
                        decimalPlaces: 2,
                    },
                });

                braintreeAnalyticTracker.selectedPaymentMethod('applepay');
                braintreeAnalyticTracker.paymentComplete();

                expect(braintreeConnectMock.events.orderPlaced).toHaveBeenCalledWith({
                    ...paymentCompleteEventOptions,
                    currency_code: 'EUR',
                });
            });
        });

        describe('#apmSelected callback', () => {
            const apmSelectedEventOptions = {
                apm_list: 'braintreeacceleratedcheckout',
                apm_location: 'payment section',
                apm_selected: 'applepay',
                apm_shown: '0',
                context_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                context_type: 'cs_id',
                experiment: '[{"treatment_group":"control"}]',
                merchant_name: 's1504098821',
                page_name: '',
                page_type: 'checkout_page',
                partner_name: 'bigc',
                store_id: '1504098821',
                user_type: 'store_member',
            };

            it('triggers apm selected event from payments list', () => {
                braintreeAnalyticTracker.selectedPaymentMethod('applepay');

                expect(braintreeConnectMock.events.apmSelected).toHaveBeenCalledWith(
                    apmSelectedEventOptions,
                );
            });

            it('triggers apm selected event as a wallet button', () => {
                braintreeAnalyticTracker.walletButtonClick('applepay');

                expect(braintreeConnectMock.events.apmSelected).toHaveBeenCalledWith({
                    ...apmSelectedEventOptions,
                    apm_location: 'pre-email section',
                });
            });
        });
    });

    describe('Braintree Fastlane Analytic tests', () => {
        beforeEach(() => {
            braintreeFastlaneMock = getFastlaneMock();
            braintreeWindow.braintreeFastlane = braintreeFastlaneMock;

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
                getBraintreeAcceleratedCheckout(true, true),
            ]);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
                getBraintreeAcceleratedCheckout(false, true),
            );
        });

        afterAll(() => {
            delete braintreeWindow.braintreeFastlane;
        });

        describe('customerPaymentMethodExecuted', () => {
            it('does not trigger anything if braintreeFastlane is not provided', () => {
                delete braintreeWindow.braintreeFastlane;

                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeFastlaneMock.events.emailSubmitted).not.toHaveBeenCalled();
            });

            it('does not trigger anything if braintree analytic feature is disabled', () => {
                const braintreeAcceleratedCheckoutMock = getBraintreeAcceleratedCheckout(
                    false,
                    true,
                );

                jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                    ...braintreeAcceleratedCheckoutMock,
                    initializationData: {
                        ...braintreeAcceleratedCheckoutMock.initializationData,
                        isBraintreeAnalyticsV2Enabled: false,
                    },
                });

                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeFastlaneMock.events.emailSubmitted).not.toHaveBeenCalled();
            });

            it('triggers emailSubmitted callback for store member', () => {
                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeFastlaneMock.events.emailSubmitted).toHaveBeenCalled();
            });
        });

        describe('paymentComplete', () => {
            it('does not trigger anything if braintreeFastlane is not provided', () => {
                delete braintreeWindow.braintreeFastlane;

                braintreeAnalyticTracker.paymentComplete();

                expect(braintreeFastlaneMock.events.orderPlaced).not.toHaveBeenCalled();
            });

            it('does not trigger anything if braintree analytic feature is disabled', () => {
                const braintreeAcceleratedCheckoutMock = getBraintreeAcceleratedCheckout(
                    false,
                    true,
                );

                jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                    ...braintreeAcceleratedCheckoutMock,
                    initializationData: {
                        ...braintreeAcceleratedCheckoutMock.initializationData,
                        isBraintreeAnalyticsV2Enabled: false,
                    },
                });

                braintreeAnalyticTracker.paymentComplete();

                expect(braintreeFastlaneMock.events.orderPlaced).not.toHaveBeenCalled();
            });

            it('triggers orderPlaced', () => {
                braintreeAnalyticTracker.paymentComplete();

                expect(braintreeFastlaneMock.events.orderPlaced).toHaveBeenCalled();
            });
        });

        describe('selectedPaymentMethod', () => {
            it('does not trigger anything if braintreeFastlane is not provided', () => {
                delete braintreeWindow.braintreeFastlane;

                braintreeAnalyticTracker.selectedPaymentMethod('applepay');

                expect(braintreeFastlaneMock.events.apmSelected).not.toHaveBeenCalled();
            });

            it('does not trigger anything if method id is not properly provided', () => {
                braintreeAnalyticTracker.selectedPaymentMethod('');

                expect(braintreeFastlaneMock.events.apmSelected).not.toHaveBeenCalled();
            });

            it('does not trigger anything if braintree analytic feature is disabled', () => {
                const braintreeAcceleratedCheckoutMock = getBraintreeAcceleratedCheckout(
                    false,
                    true,
                );

                jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                    ...braintreeAcceleratedCheckoutMock,
                    initializationData: {
                        ...braintreeAcceleratedCheckoutMock.initializationData,
                        isBraintreeAnalyticsV2Enabled: false,
                    },
                });

                braintreeAnalyticTracker.selectedPaymentMethod('applepay');

                expect(braintreeFastlaneMock.events.apmSelected).not.toHaveBeenCalled();
            });

            it('triggers apm selected event', () => {
                braintreeAnalyticTracker.selectedPaymentMethod('applepay');

                expect(braintreeFastlaneMock.events.apmSelected).toHaveBeenCalled();
            });
        });

        describe('walletButtonClick', () => {
            it('does not trigger anything if braintreeFastlane is not provided', () => {
                delete braintreeWindow.braintreeFastlane;

                braintreeAnalyticTracker.walletButtonClick('applepay');

                expect(braintreeFastlaneMock.events.apmSelected).not.toHaveBeenCalled();
            });

            it('does not trigger anything if method id is not properly provided', () => {
                braintreeAnalyticTracker.walletButtonClick('');

                expect(braintreeFastlaneMock.events.apmSelected).not.toHaveBeenCalled();
            });

            it('does not trigger anything if braintree analytic feature is disabled', () => {
                const braintreeAcceleratedCheckoutMock = getBraintreeAcceleratedCheckout(
                    false,
                    true,
                );

                jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                    ...braintreeAcceleratedCheckoutMock,
                    initializationData: {
                        ...braintreeAcceleratedCheckoutMock.initializationData,
                        isBraintreeAnalyticsV2Enabled: false,
                    },
                });

                braintreeAnalyticTracker.walletButtonClick('applepay');

                expect(braintreeFastlaneMock.events.apmSelected).not.toHaveBeenCalled();
            });

            it('triggers apm selected event', () => {
                braintreeAnalyticTracker.walletButtonClick('applepay');

                expect(braintreeFastlaneMock.events.apmSelected).toHaveBeenCalled();
            });
        });

        describe('#emailSubmitted callback', () => {
            const emailSubmitEventOptions = {
                apm_list: 'braintreeacceleratedcheckout',
                apm_shown: '0',
                context_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                context_type: 'cs_id',
                experiment: '[{"treatment_group":"control"}]',
                merchant_name: 's1504098821',
                page_name: '',
                page_type: 'checkout_page',
                partner_name: 'bigc',
                store_id: '1504098821',
                user_email_saved: false,
                user_type: 'store_member',
            };

            it('calls emailSubmitted callback for store member', () => {
                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeFastlaneMock.events.emailSubmitted).toHaveBeenCalledWith(
                    emailSubmitEventOptions,
                );
            });

            it('calls emailSubmitted callback for guest user', () => {
                jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(
                    guestCustomer,
                );

                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeFastlaneMock.events.emailSubmitted).toHaveBeenCalledWith({
                    ...emailSubmitEventOptions,
                    user_type: 'store_guest', // <-- this option changes based on "guest"/"store member" user
                });
            });

            it('calls emailSubmitted callback for users from control group', () => {
                jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
                    getBraintreeAcceleratedCheckout(false, true),
                ]);

                jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
                    getBraintreeAcceleratedCheckout(false, true),
                );

                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeFastlaneMock.events.emailSubmitted).toHaveBeenCalledWith({
                    ...emailSubmitEventOptions,
                    experiment: '[{"treatment_group":"control"}]', // <- user in test group means that BT AXO feature is not available due to A/B testing flow
                });
            });

            it('calls emailSubmitted callback for users from test group', () => {
                jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
                    getBraintreeAcceleratedCheckout(true, true),
                ]);

                jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
                    getBraintreeAcceleratedCheckout(true, true),
                );

                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeFastlaneMock.events.emailSubmitted).toHaveBeenCalledWith({
                    ...emailSubmitEventOptions,
                    experiment: '[{"treatment_group":"test"}]',
                });
            });

            it('calls emailSubmitted callback and place user in a control group if there was an error loading braintreeacceleratedcheckout payment method', () => {
                jest.spyOn(
                    checkoutService.getState().errors,
                    'getLoadPaymentMethodError',
                ).mockReturnValue(Error('asd'));

                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeFastlaneMock.events.emailSubmitted).toHaveBeenCalledWith({
                    ...emailSubmitEventOptions,
                    experiment: '[{"treatment_group":"control"}]',
                });
            });

            it('calls emailSubmitted callback with apm options', () => {
                jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
                    getBraintree(),
                    getBraintreeAcceleratedCheckout(false, true),
                ]);

                jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
                    getBraintreeAcceleratedCheckout(false, true),
                );

                braintreeAnalyticTracker.customerPaymentMethodExecuted();

                expect(braintreeFastlaneMock.events.emailSubmitted).toHaveBeenCalledWith({
                    ...emailSubmitEventOptions,
                    apm_list: 'braintree,braintreeacceleratedcheckout',
                    apm_shown: '1',
                });
            });
        });

        describe('#paymentComplete callback', () => {
            const paymentCompleteEventOptions = {
                context_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                context_type: 'cs_id',
                currency_code: 'USD', // <- related to paymentComplete callback
                experiment: '[{"treatment_group":"control"}]',
                merchant_name: 's1504098821',
                page_name: '',
                page_type: 'checkout_page',
                partner_name: 'bigc',
                selected_payment_method: 'applepay', // <- related to paymentComplete callback
                store_id: '1504098821',
                user_type: 'store_member',
            };

            it('triggers paymentComplete with provided selected method', () => {
                braintreeAnalyticTracker.selectedPaymentMethod('applepay');
                braintreeAnalyticTracker.paymentComplete();

                expect(braintreeFastlaneMock.events.orderPlaced).toHaveBeenCalledWith(
                    paymentCompleteEventOptions,
                );
            });

            it('triggers paymentComplete with provided with different payment method selected method', () => {
                braintreeAnalyticTracker.selectedPaymentMethod('braintreeacceleratedcheckout');
                braintreeAnalyticTracker.paymentComplete();

                expect(braintreeFastlaneMock.events.orderPlaced).toHaveBeenCalledWith({
                    ...paymentCompleteEventOptions,
                    selected_payment_method: 'braintreeacceleratedcheckout',
                });
            });

            it('triggers paymentComplete with provided with EUR currency code', () => {
                jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue({
                    ...getCart(),
                    currency: {
                        name: 'Euro',
                        code: 'EUR',
                        symbol: '€',
                        decimalPlaces: 2,
                    },
                });

                braintreeAnalyticTracker.selectedPaymentMethod('applepay');
                braintreeAnalyticTracker.paymentComplete();

                expect(braintreeFastlaneMock.events.orderPlaced).toHaveBeenCalledWith({
                    ...paymentCompleteEventOptions,
                    currency_code: 'EUR',
                });
            });
        });

        describe('#apmSelected callback', () => {
            const apmSelectedEventOptions = {
                apm_list: 'braintreeacceleratedcheckout',
                apm_location: 'payment section',
                apm_selected: 'applepay',
                apm_shown: '0',
                context_id: 'b20deef40f9699e48671bbc3fef6ca44dc80e3c7',
                context_type: 'cs_id',
                experiment: '[{"treatment_group":"control"}]',
                merchant_name: 's1504098821',
                page_name: '',
                page_type: 'checkout_page',
                partner_name: 'bigc',
                store_id: '1504098821',
                user_type: 'store_member',
            };

            it('triggers apm selected event from payments list', () => {
                braintreeAnalyticTracker.selectedPaymentMethod('applepay');

                expect(braintreeFastlaneMock.events.apmSelected).toHaveBeenCalledWith(
                    apmSelectedEventOptions,
                );
            });

            it('triggers apm selected event as a wallet button', () => {
                braintreeAnalyticTracker.walletButtonClick('applepay');

                expect(braintreeFastlaneMock.events.apmSelected).toHaveBeenCalledWith({
                    ...apmSelectedEventOptions,
                    apm_location: 'pre-email section',
                });
            });
        });
    });
});
