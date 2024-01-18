import {
    getPayPalCommerceAcceleratedCheckoutPaymentMethod,
    getPayPalCommercePaymentMethod,
    getPayPalConnect,
    PayPalCommerceConnect,
    PayPalCommerceHostWindow,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import { getCart } from '../../cart/carts.mock';
import { CheckoutService, createCheckoutService } from '../../checkout';
import { getCheckoutWithCoupons } from '../../checkout/checkouts.mock';
import { getConfig } from '../../config/configs.mock';
import { getCustomer } from '../../customer/customers.mock';

import PayPalCommerceConnectTracker from './paypal-commerce-connect-tracker';
import PayPalCommerceConnectTrackerService from './paypal-commerce-connect-tracker-service';

describe('PayPalCommerceConnectTracker', () => {
    let paypalCommerceConnectMock: PayPalCommerceConnect;
    let paypalCommerceConnectWindow: Window & Partial<PayPalCommerceHostWindow>;
    let paypalCommerceConnectTracker: PayPalCommerceConnectTrackerService;
    let checkoutService: CheckoutService;

    const getPayPalCommerceAcceleratedCheckout = (isControlGroup: boolean) => ({
        ...getPayPalCommerceAcceleratedCheckoutPaymentMethod(),
        id: 'paypalcommerceacceleratedcheckout',
        initializationData: {
            isAcceleratedCheckoutEnabled: true,
            shouldRunAcceleratedCheckout: isControlGroup,
            isPayPalCommerceAnalyticsV2Enabled: true,
        },
    });

    const guestCustomer = {
        ...getCustomer(),
        isGuest: true,
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        paypalCommerceConnectMock = getPayPalConnect();
        paypalCommerceConnectWindow = window;
        paypalCommerceConnectWindow.paypalConnect = paypalCommerceConnectMock;
        paypalCommerceConnectTracker = new PayPalCommerceConnectTracker(checkoutService);

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(
            getCheckoutWithCoupons(),
        );

        jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(
            getConfig().storeConfig,
        );

        jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
            getPayPalCommerceAcceleratedCheckout(true),
        ]);
        jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
            getPayPalCommerceAcceleratedCheckout(false),
        );
    });

    describe('customerPaymentMethodExecuted', () => {
        it('does not trigger anything if paypalConnect is not provided', () => {
            delete paypalCommerceConnectWindow.paypalConnect;

            paypalCommerceConnectTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceConnectMock.events.emailSubmitted).not.toHaveBeenCalled();
        });

        it('does not trigger anything if paypal commerce connect analytic feature is disabled', () => {
            const paymentMethodMock = getPayPalCommerceAcceleratedCheckout(false);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                ...paymentMethodMock,
                initializationData: {
                    ...paymentMethodMock.initializationData,
                    isPayPalCommerceAnalyticsV2Enabled: false,
                },
            });

            paypalCommerceConnectTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceConnectMock.events.emailSubmitted).not.toHaveBeenCalled();
        });

        it('triggers emailSubmitted callback for store member', () => {
            paypalCommerceConnectTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceConnectMock.events.emailSubmitted).toHaveBeenCalled();
        });
    });

    describe('paymentComplete', () => {
        it('does not trigger anything if paypalConnect is not provided', () => {
            delete paypalCommerceConnectWindow.paypalConnect;

            paypalCommerceConnectTracker.paymentComplete();

            expect(paypalCommerceConnectMock.events.orderPlaced).not.toHaveBeenCalled();
        });

        it('does not trigger anything if paypal commerce connect analytic feature is disabled', () => {
            const paymentMethodMock = getPayPalCommerceAcceleratedCheckout(false);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                ...paymentMethodMock,
                initializationData: {
                    ...paymentMethodMock.initializationData,
                    isPayPalCommerceAnalyticsV2Enabled: false,
                },
            });

            paypalCommerceConnectTracker.paymentComplete();

            expect(paypalCommerceConnectMock.events.orderPlaced).not.toHaveBeenCalled();
        });

        it('triggers orderPlaced', () => {
            paypalCommerceConnectTracker.paymentComplete();

            expect(paypalCommerceConnectMock.events.orderPlaced).toHaveBeenCalled();
        });
    });

    describe('selectedPaymentMethod', () => {
        it('does not trigger anything if paypalConnect is not provided', () => {
            delete paypalCommerceConnectWindow.paypalConnect;

            paypalCommerceConnectTracker.selectedPaymentMethod('applepay');

            expect(paypalCommerceConnectMock.events.apmSelected).not.toHaveBeenCalled();
        });

        it('does not trigger anything if method id is not properly provided', () => {
            paypalCommerceConnectTracker.selectedPaymentMethod('');

            expect(paypalCommerceConnectMock.events.apmSelected).not.toHaveBeenCalled();
        });

        it('does not trigger anything if paypal commerce connect analytic feature is disabled', () => {
            const paymentMethodMock = getPayPalCommerceAcceleratedCheckout(false);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                ...paymentMethodMock,
                initializationData: {
                    ...paymentMethodMock.initializationData,
                    isPayPalCommerceAnalyticsV2Enabled: false,
                },
            });

            paypalCommerceConnectTracker.selectedPaymentMethod('applepay');

            expect(paypalCommerceConnectMock.events.apmSelected).not.toHaveBeenCalled();
        });

        it('triggers apm selected event', () => {
            paypalCommerceConnectTracker.selectedPaymentMethod('applepay');

            expect(paypalCommerceConnectMock.events.apmSelected).toHaveBeenCalled();
        });
    });

    describe('walletButtonClick', () => {
        it('does not trigger anything if paypalConnect is not provided', () => {
            delete paypalCommerceConnectWindow.paypalConnect;

            paypalCommerceConnectTracker.walletButtonClick('applepay');

            expect(paypalCommerceConnectMock.events.apmSelected).not.toHaveBeenCalled();
        });

        it('does not trigger anything if method id is not properly provided', () => {
            paypalCommerceConnectTracker.walletButtonClick('');

            expect(paypalCommerceConnectMock.events.apmSelected).not.toHaveBeenCalled();
        });

        it('does not trigger anything if paypal commerce connect analytic feature is disabled', () => {
            const paymentMethodMock = getPayPalCommerceAcceleratedCheckout(false);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue({
                ...paymentMethodMock,
                initializationData: {
                    ...paymentMethodMock.initializationData,
                    isPayPalCommerceAnalyticsV2Enabled: false,
                },
            });

            paypalCommerceConnectTracker.walletButtonClick('applepay');

            expect(paypalCommerceConnectMock.events.apmSelected).not.toHaveBeenCalled();
        });

        it('triggers apm selected event', () => {
            paypalCommerceConnectTracker.walletButtonClick('applepay');

            expect(paypalCommerceConnectMock.events.apmSelected).toHaveBeenCalled();
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
            paypalCommerceConnectTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceConnectMock.events.emailSubmitted).toHaveBeenCalledWith(
                emailSubmitEventOptions,
            );
        });

        it('calls emailSubmitted callback for guest user', () => {
            jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(
                guestCustomer,
            );

            paypalCommerceConnectTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceConnectMock.events.emailSubmitted).toHaveBeenCalledWith({
                ...emailSubmitEventOptions,
                user_type: 'store_guest', // <-- this option changes based on "guest"/"store member" user
            });
        });

        it('calls emailSubmitted callback for users from control group', () => {
            jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
                getPayPalCommerceAcceleratedCheckout(false),
            ]);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
                getPayPalCommerceAcceleratedCheckout(false),
            );

            paypalCommerceConnectTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceConnectMock.events.emailSubmitted).toHaveBeenCalledWith({
                ...emailSubmitEventOptions,
                experiment: '[{"treatment_group":"control"}]', // <- user in test group means that BT AXO feature is not available due to A/B testing flow
            });
        });

        it('calls emailSubmitted callback for users from test group', () => {
            jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
                getPayPalCommerceAcceleratedCheckout(true),
            ]);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
                getPayPalCommerceAcceleratedCheckout(true),
            );

            paypalCommerceConnectTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceConnectMock.events.emailSubmitted).toHaveBeenCalledWith({
                ...emailSubmitEventOptions,
                experiment: '[{"treatment_group":"test"}]',
            });
        });

        it('calls emailSubmitted callback and place user in a control group if there was an error loading paypalcommerceacceleratedcheckout payment method', () => {
            jest.spyOn(
                checkoutService.getState().errors,
                'getLoadPaymentMethodError',
            ).mockReturnValue(Error('asd'));

            paypalCommerceConnectTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceConnectMock.events.emailSubmitted).toHaveBeenCalledWith({
                ...emailSubmitEventOptions,
                experiment: '[{"treatment_group":"control"}]',
            });
        });

        it('calls emailSubmitted callback with apm options', () => {
            jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([
                getPayPalCommercePaymentMethod(),
                getPayPalCommerceAcceleratedCheckout(false),
            ]);

            jest.spyOn(checkoutService.getState().data, 'getPaymentMethod').mockReturnValue(
                getPayPalCommerceAcceleratedCheckout(false),
            );

            paypalCommerceConnectTracker.customerPaymentMethodExecuted();

            expect(paypalCommerceConnectMock.events.emailSubmitted).toHaveBeenCalledWith({
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
            paypalCommerceConnectTracker.selectedPaymentMethod('applepay');
            paypalCommerceConnectTracker.paymentComplete();

            expect(paypalCommerceConnectMock.events.orderPlaced).toHaveBeenCalledWith(
                paymentCompleteEventOptions,
            );
        });

        it('triggers paymentComplete with provided with different payment method selected method', () => {
            paypalCommerceConnectTracker.selectedPaymentMethod('paypalcommerceacceleratedcheckout');
            paypalCommerceConnectTracker.paymentComplete();

            expect(paypalCommerceConnectMock.events.orderPlaced).toHaveBeenCalledWith({
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

            paypalCommerceConnectTracker.selectedPaymentMethod('applepay');
            paypalCommerceConnectTracker.paymentComplete();

            expect(paypalCommerceConnectMock.events.orderPlaced).toHaveBeenCalledWith({
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
            paypalCommerceConnectTracker.selectedPaymentMethod('applepay');

            expect(paypalCommerceConnectMock.events.apmSelected).toHaveBeenCalledWith(
                apmSelectedEventOptions,
            );
        });

        it('triggers apm selected event as a wallet button', () => {
            paypalCommerceConnectTracker.walletButtonClick('applepay');

            expect(paypalCommerceConnectMock.events.apmSelected).toHaveBeenCalledWith({
                ...apmSelectedEventOptions,
                apm_location: 'pre-email section',
            });
        });
    });
});
