import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    isPayPalCommerceConnectWindow,
    isPayPalCommerceFastlaneWindow,
    PayPalFastlaneApmSelectedEventOptions,
    PayPalFastlaneEmailEnteredEventOptions,
    PayPalFastlaneEventCommonOptions,
    PayPalFastlaneEvents,
    PayPalFastlaneOrderPlacedEventOptions,
} from '@bigcommerce/checkout-sdk/paypal-commerce-utils';

import { CheckoutService } from '../../checkout';

import PayPalCommerceAnalyticTrackerService from './paypal-commerce-analytic-tracker-service';

export default class PayPalCommerceAnalyticTracker implements PayPalCommerceAnalyticTrackerService {
    private _selectedPaymentMethodId = 'paypalcommerceacceleratedcheckout';

    constructor(private _checkoutService: CheckoutService) {}

    customerPaymentMethodExecuted(): void {
        if (this._shouldTrackFastlaneEvent()) {
            this._trackEmailSubmitted();
        }
    }

    paymentComplete(): void {
        if (this._shouldTrackFastlaneEvent()) {
            this._trackOrderPlaced(this._selectedPaymentMethodId);
        }
    }

    selectedPaymentMethod(methodId: string): void {
        if (this._shouldTrackFastlaneEvent() && methodId) {
            this._selectedPaymentMethodId = methodId;

            this._trackApmSelected(methodId, false);
        }
    }

    walletButtonClick(methodId: string): void {
        if (this._shouldTrackFastlaneEvent() && methodId) {
            this._selectedPaymentMethodId = methodId;

            this._trackApmSelected(methodId, true);
        }
    }

    private _shouldTrackFastlaneEvent(): boolean {
        const state = this._checkoutService.getState();
        const paymentMethod = state.data.getPaymentMethod('paypalcommerce');
        const initializationData = paymentMethod?.initializationData || {};
        const isAnalyticEnabled = initializationData.isPayPalCommerceAnalyticsV2Enabled;
        const isFastlaneEnabled = initializationData.isFastlaneEnabled;

        const isAvailableAnalyticEventsMethods = isFastlaneEnabled
            ? isPayPalCommerceFastlaneWindow(window) && window.paypalFastlane?.events
            : isPayPalCommerceConnectWindow(window) && window.paypalConnect?.events;

        return isAnalyticEnabled && isAvailableAnalyticEventsMethods;
    }

    private _getPayPalEventsOrThrow(): PayPalFastlaneEvents {
        if (isPayPalCommerceConnectWindow(window) && window.paypalConnect) {
            return window.paypalConnect.events;
        }

        if (isPayPalCommerceFastlaneWindow(window) && window.paypalFastlane) {
            return window.paypalFastlane.events;
        }

        throw new PaymentMethodClientUnavailableError();
    }

    /**
     *
     * Analytic Event track methods
     *
     */
    private _trackEmailSubmitted(): void {
        const { emailSubmitted } = this._getPayPalEventsOrThrow();
        const eventOptions = this._getEmailSubmittedEventOptions();

        emailSubmitted(eventOptions);
    }

    private _trackApmSelected(methodId: string, isWalletButton: boolean): void {
        const { apmSelected } = this._getPayPalEventsOrThrow();
        const eventOptions = this._getApmSelectedEventOptions(methodId, isWalletButton);

        apmSelected(eventOptions);
    }

    private _trackOrderPlaced(methodId: string): void {
        const { orderPlaced } = this._getPayPalEventsOrThrow();
        const eventOptions = this._getOrderPlacedEventOptions(methodId);

        orderPlaced(eventOptions);
    }

    /**
     *
     * Event options methods
     *
     */
    private _getEventCommonOptions(): PayPalFastlaneEventCommonOptions {
        const state = this._checkoutService.getState();
        const cart = state.data.getCart();
        const storeProfile = state.data.getConfig()?.storeProfile;
        const isGuestCustomer = state.data.getCustomer()?.isGuest;
        const methodId = 'paypalcommerceacceleratedcheckout';

        const paymentMethod = state.data.getPaymentMethod(methodId);
        const isTestTreatmentGroup =
            !state.errors.getLoadPaymentMethodError(methodId) &&
            paymentMethod?.initializationData.shouldRunAcceleratedCheckout;

        const experiments = [
            {
                treatment_group: isTestTreatmentGroup ? 'test' : 'control',
            },
        ];

        return {
            context_type: 'cs_id',
            context_id: cart?.id.replace(/-/g, '') || '',
            page_type: 'checkout_page',
            page_name: window.document.title,
            partner_name: 'bigc',
            user_type: isGuestCustomer ? 'store_guest' : 'store_member',
            store_id: storeProfile?.storeId || '',
            merchant_name: storeProfile?.storeName || '',
            experiment: JSON.stringify(experiments),
        };
    }

    private _getEmailSubmittedEventOptions(): PayPalFastlaneEmailEnteredEventOptions {
        const state = this._checkoutService.getState().data;
        const paymentMethods = state.getPaymentMethods() || [];
        const apmList = paymentMethods.map(({ id }) => id);

        return {
            ...this._getEventCommonOptions(),
            user_email_saved: false,
            apm_shown: apmList.length > 1 ? '1' : '0',
            apm_list: apmList.join(','),
        };
    }

    private _getApmSelectedEventOptions(
        methodId: string,
        isWalletButton: boolean,
    ): PayPalFastlaneApmSelectedEventOptions {
        const state = this._checkoutService.getState().data;
        const paymentMethods = state.getPaymentMethods() || [];
        const apmList = paymentMethods.map(({ id }) => id);

        return {
            ...this._getEventCommonOptions(),
            apm_shown: apmList.length > 1 ? '1' : '0',
            apm_list: apmList.join(','),
            apm_selected: methodId,
            apm_location: isWalletButton ? 'pre-email section' : 'payment section',
        };
    }

    private _getOrderPlacedEventOptions(methodId: string): PayPalFastlaneOrderPlacedEventOptions {
        const state = this._checkoutService.getState().data;
        const cart = state.getCart();

        return {
            ...this._getEventCommonOptions(),
            selected_payment_method: methodId,
            currency_code: cart?.currency.code || '',
        };
    }
}
