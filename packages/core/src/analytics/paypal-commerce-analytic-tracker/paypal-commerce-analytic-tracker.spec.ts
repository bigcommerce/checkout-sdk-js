import {
    getPayPalCommerceAcceleratedCheckoutPaymentMethod,
    getPayPalCommercePaymentMethod,
    getPayPalFastlane,
    PayPalCommerceHostWindow,
    PayPalFastlane,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import { getCart } from '../../cart/carts.mock';
import { CheckoutService, createCheckoutService } from '../../checkout';
import { getCheckoutWithCoupons } from '../../checkout/checkouts.mock';
import { getConfig } from '../../config/configs.mock';
import { getCustomer } from '../../customer/customers.mock';

import PayPalCommerceAnalyticTracker from './paypal-commerce-analytic-tracker';
import PayPalCommerceAnalyticTrackerService from './paypal-commerce-analytic-tracker-service';

describe('PayPalCommerceAnalyticTracker', () => {
    let paypalCommerceFastlaneMock: PayPalFastlane;
    let paypalCommerceFastlaneWindow: Window & Partial<PayPalCommerceHostWindow>;
    let paypalCommerceFastlaneTracker: PayPalCommerceAnalyticTrackerService;
    let checkoutService: CheckoutService;

    const getPayPalCommerceAcceleratedCheckout = (
        isControlGroup: boolean,
        isFastlaneEnabled = false,
    ) => ({
        ...getPayPalCommerceAcceleratedCheckoutPaymentMethod(),
        id: 'paypalcommerceacceleratedcheckout',
        initializationData: {
            isAcceleratedCheckoutEnabled: true,
            shouldRunAcceleratedCheckout: isControlGroup,
            isPayPalCommerceAnalyticsV2Enabled: true,
            isFastlaneEnabled,
        },
    });

    const guestCustomer = {
        ...getCustomer(),
        isGuest: true,
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        paypalCommerceFastlaneTracker = new PayPalCommerceAnalyticTracker(checkoutService);
        paypalCommerceFastlaneMock = getPayPalFastlane();
        paypalCommerceFastlaneWindow = window;
        paypalCommerceFastlaneWindow.paypalFastlane = paypalCommerceFastlaneMock;

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(
            getCheckoutWithCoupons(),
        );

        jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(
            getConfig().storeConfig,
        );

        jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
            getPayPalCommerceAcceleratedCheckout(true, true),
        ]);
        jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
            getPayPalCommerceAcceleratedCheckout(false, true),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('customerPaymentMethodExecuted', () => {
        it('does not trigger anything if paypalFastlane is not provided', () => {
            delete paypalCommerceFastlaneWindow.paypalFastlane;

            paypalCommerceFastlaneTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceFastlaneMock.events.emailSubmitted).not.toHaveBeenCalled();
        });

        it('does not trigger anything if paypal commerce analytic feature is disabled', () => {
            const paymentMethodMock = getPayPalCommerceAcceleratedCheckout(false, true);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                ...paymentMethodMock,
                initializationData: {
                    ...paymentMethodMock.initializationData,
                    isPayPalCommerceAnalyticsV2Enabled: false,
                },
            });

            paypalCommerceFastlaneTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceFastlaneMock.events.emailSubmitted).not.toHaveBeenCalled();
        });

        it('triggers emailSubmitted callback for store member', () => {
            paypalCommerceFastlaneTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceFastlaneMock.events.emailSubmitted).toHaveBeenCalled();
        });
    });

    describe('paymentComplete', () => {
        it('does not trigger anything if paypalFastlane is not provided', () => {
            delete paypalCommerceFastlaneWindow.paypalFastlane;

            paypalCommerceFastlaneTracker.paymentComplete();

            expect(paypalCommerceFastlaneMock.events.orderPlaced).not.toHaveBeenCalled();
        });

        it('does not trigger anything if paypal commerce analytic feature is disabled', () => {
            const paymentMethodMock = getPayPalCommerceAcceleratedCheckout(false, true);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                ...paymentMethodMock,
                initializationData: {
                    ...paymentMethodMock.initializationData,
                    isPayPalCommerceAnalyticsV2Enabled: false,
                },
            });

            paypalCommerceFastlaneTracker.paymentComplete();

            expect(paypalCommerceFastlaneMock.events.orderPlaced).not.toHaveBeenCalled();
        });

        it('triggers orderPlaced', () => {
            paypalCommerceFastlaneTracker.paymentComplete();

            expect(paypalCommerceFastlaneMock.events.orderPlaced).toHaveBeenCalled();
        });
    });

    describe('selectedPaymentMethod', () => {
        it('does not trigger anything if paypalFastlane is not provided', () => {
            delete paypalCommerceFastlaneWindow.paypalFastlane;

            paypalCommerceFastlaneTracker.selectedPaymentMethod('applepay');

            expect(paypalCommerceFastlaneMock.events.apmSelected).not.toHaveBeenCalled();
        });

        it('does not trigger anything if method id is not properly provided', () => {
            paypalCommerceFastlaneTracker.selectedPaymentMethod('');

            expect(paypalCommerceFastlaneMock.events.apmSelected).not.toHaveBeenCalled();
        });

        it('does not trigger anything if paypal commerce analytic feature is disabled', () => {
            const paymentMethodMock = getPayPalCommerceAcceleratedCheckout(false, true);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                ...paymentMethodMock,
                initializationData: {
                    ...paymentMethodMock.initializationData,
                    isPayPalCommerceAnalyticsV2Enabled: false,
                },
            });

            paypalCommerceFastlaneTracker.selectedPaymentMethod('applepay');

            expect(paypalCommerceFastlaneMock.events.apmSelected).not.toHaveBeenCalled();
        });

        it('triggers apm selected event', () => {
            paypalCommerceFastlaneTracker.selectedPaymentMethod('applepay');

            expect(paypalCommerceFastlaneMock.events.apmSelected).toHaveBeenCalled();
        });
    });

    describe('walletButtonClick', () => {
        it('does not trigger anything if paypalFastlane is not provided', () => {
            delete paypalCommerceFastlaneWindow.paypalFastlane;

            paypalCommerceFastlaneTracker.walletButtonClick('applepay');

            expect(paypalCommerceFastlaneMock.events.apmSelected).not.toHaveBeenCalled();
        });

        it('does not trigger anything if method id is not properly provided', () => {
            paypalCommerceFastlaneTracker.walletButtonClick('');

            expect(paypalCommerceFastlaneMock.events.apmSelected).not.toHaveBeenCalled();
        });

        it('does not trigger anything if paypal commerce analytic feature is disabled', () => {
            const paymentMethodMock = getPayPalCommerceAcceleratedCheckout(false, true);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                ...paymentMethodMock,
                initializationData: {
                    ...paymentMethodMock.initializationData,
                    isPayPalCommerceAnalyticsV2Enabled: false,
                },
            });

            paypalCommerceFastlaneTracker.walletButtonClick('applepay');

            expect(paypalCommerceFastlaneMock.events.apmSelected).not.toHaveBeenCalled();
        });

        it('triggers apm selected event', () => {
            paypalCommerceFastlaneTracker.walletButtonClick('applepay');

            expect(paypalCommerceFastlaneMock.events.apmSelected).toHaveBeenCalled();
        });
    });

    describe('#emailSubmitted callback', () => {
        const emailSubmitEventOptions = {
            apm_list: 'paypalcommerceacceleratedcheckout',
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
            paypalCommerceFastlaneTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceFastlaneMock.events.emailSubmitted).toHaveBeenCalledWith(
                emailSubmitEventOptions,
            );
        });

        it('calls emailSubmitted callback for guest user', () => {
            jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(
                guestCustomer,
            );

            paypalCommerceFastlaneTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceFastlaneMock.events.emailSubmitted).toHaveBeenCalledWith({
                ...emailSubmitEventOptions,
                user_type: 'store_guest', // <-- this option changes based on "guest"/"store member" user
            });
        });

        it('calls emailSubmitted callback for users from control group', () => {
            jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
                getPayPalCommerceAcceleratedCheckout(false, true),
            ]);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
                getPayPalCommerceAcceleratedCheckout(false, true),
            );

            paypalCommerceFastlaneTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceFastlaneMock.events.emailSubmitted).toHaveBeenCalledWith({
                ...emailSubmitEventOptions,
                experiment: '[{"treatment_group":"control"}]', // <- user in test group means that BT AXO feature is not available due to A/B testing flow
            });
        });

        it('calls emailSubmitted callback for users from test group', () => {
            jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
                getPayPalCommerceAcceleratedCheckout(true, true),
            ]);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
                getPayPalCommerceAcceleratedCheckout(true, true),
            );

            paypalCommerceFastlaneTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceFastlaneMock.events.emailSubmitted).toHaveBeenCalledWith({
                ...emailSubmitEventOptions,
                experiment: '[{"treatment_group":"test"}]',
            });
        });

        it('calls emailSubmitted callback and place user in a control group if there was an error loading paypalcommerceacceleratedcheckout payment method', () => {
            jest.spyOn(
                checkoutService.getState().errors,
                'getLoadPaymentMethodError',
            ).mockReturnValue(Error('asd'));

            paypalCommerceFastlaneTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceFastlaneMock.events.emailSubmitted).toHaveBeenCalledWith({
                ...emailSubmitEventOptions,
                experiment: '[{"treatment_group":"control"}]',
            });
        });

        it('calls emailSubmitted callback with apm options', () => {
            jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
                getPayPalCommercePaymentMethod(),
                getPayPalCommerceAcceleratedCheckout(false, true),
            ]);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
                getPayPalCommerceAcceleratedCheckout(false, true),
            );

            paypalCommerceFastlaneTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceFastlaneMock.events.emailSubmitted).toHaveBeenCalledWith({
                ...emailSubmitEventOptions,
                apm_list: 'paypalcommerce,paypalcommerceacceleratedcheckout',
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
            paypalCommerceFastlaneTracker.selectedPaymentMethod('applepay');
            paypalCommerceFastlaneTracker.paymentComplete();

            expect(paypalCommerceFastlaneMock.events.orderPlaced).toHaveBeenCalledWith(
                paymentCompleteEventOptions,
            );
        });

        it('triggers paymentComplete with provided with different payment method selected method', () => {
            paypalCommerceFastlaneTracker.selectedPaymentMethod(
                'paypalcommerceacceleratedcheckout',
            );
            paypalCommerceFastlaneTracker.paymentComplete();

            expect(paypalCommerceFastlaneMock.events.orderPlaced).toHaveBeenCalledWith({
                ...paymentCompleteEventOptions,
                selected_payment_method: 'paypalcommerceacceleratedcheckout',
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

            paypalCommerceFastlaneTracker.selectedPaymentMethod('applepay');
            paypalCommerceFastlaneTracker.paymentComplete();

            expect(paypalCommerceFastlaneMock.events.orderPlaced).toHaveBeenCalledWith({
                ...paymentCompleteEventOptions,
                currency_code: 'EUR',
            });
        });
    });

    describe('#apmSelected callback', () => {
        const apmSelectedEventOptions = {
            apm_list: 'paypalcommerceacceleratedcheckout',
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
            paypalCommerceFastlaneTracker.selectedPaymentMethod('applepay');

            expect(paypalCommerceFastlaneMock.events.apmSelected).toHaveBeenCalledWith(
                apmSelectedEventOptions,
            );
        });

        it('triggers apm selected event as a wallet button', () => {
            paypalCommerceFastlaneTracker.walletButtonClick('applepay');

            expect(paypalCommerceFastlaneMock.events.apmSelected).toHaveBeenCalledWith({
                ...apmSelectedEventOptions,
                apm_location: 'pre-email section',
            });
        });
    });
});
