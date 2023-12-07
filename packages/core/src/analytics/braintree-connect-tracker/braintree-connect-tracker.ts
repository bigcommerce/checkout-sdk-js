import {
    BraintreeConnect,
    BraintreeConnectApmSelectedEventOptions,
    BraintreeConnectEmailEnteredEventOptions,
    BraintreeConnectEventCommonOptions,
    BraintreeConnectOrderPlacedEventOptions,
    isBraintreeConnectWindow,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutService } from '../../checkout';

import BraintreeConnectTrackerService from './braintree-connect-tracker-service';

export default class BraintreeConnectTracker implements BraintreeConnectTrackerService {
    private _shouldTriggerEventSubmittedEvent = true;
    private _selectedPaymentMethodId = 'braintreeacceleratedcheckout';

    constructor(private checkoutService: CheckoutService) {}

    customerPaymentMethodExecuted() {
        if (this._shouldTrackEvent()) {
            this._shouldTriggerEventSubmittedEvent = false;

            this._trackEmailSubmitted(false);
        }
    }

    trackStepViewed(step: string) {
        if (
            this._shouldTrackEvent() &&
            this._shouldTriggerEventSubmittedEvent &&
            step !== 'customer'
        ) {
            this._shouldTriggerEventSubmittedEvent = false;

            this._trackEmailSubmitted(true);
        }
    }

    paymentComplete() {
        if (this._shouldTrackEvent()) {
            if (this._shouldTriggerEventSubmittedEvent) {
                this._trackEmailSubmitted(true);
            }

            this._trackOrderPlaced(this._selectedPaymentMethodId);
        }
    }

    selectedPaymentMethod(methodId: string): void {
        if (this._shouldTrackEvent() && methodId) {
            this._selectedPaymentMethodId = methodId;

            this._trackApmSelected(methodId, false);
        }
    }

    walletButtonClick(methodId: string) {
        if (this._shouldTrackEvent() && methodId) {
            this._selectedPaymentMethodId = methodId;

            this._trackApmSelected(methodId, true);
        }
    }

    private _shouldTrackEvent() {
        return isBraintreeConnectWindow(window) && window.braintreeConnect.events;
    }

    private _getBraintreeConnectEventsOrThrow(): BraintreeConnect['events'] {
        if (isBraintreeConnectWindow(window)) {
            return window.braintreeConnect.events;
        }

        throw new PaymentMethodClientUnavailableError();
    }

    /**
     *
     * Braintree Connect Event track methods
     *
     */
    private _trackEmailSubmitted(isEmailPrefilled: boolean): void {
        const { emailSubmitted } = this._getBraintreeConnectEventsOrThrow();
        const eventOptions = this._getEmailSubmittedEventOptions(isEmailPrefilled);

        emailSubmitted(eventOptions);
    }

    private _trackApmSelected(methodId: string, isWalletButton: boolean): void {
        const { apmSelected } = this._getBraintreeConnectEventsOrThrow();
        const eventOptions = this._getApmSelectedEventOptions(methodId, isWalletButton);

        apmSelected(eventOptions);
    }

    private _trackOrderPlaced(methodId: string): void {
        const { orderPlaced } = this._getBraintreeConnectEventsOrThrow();
        const eventOptions = this._getOrderPlacedEventOptions(methodId);

        orderPlaced(eventOptions);
    }

    /**
     *
     * Event options methods
     *
     */
    private _getEventCommonOptions(): BraintreeConnectEventCommonOptions {
        const state = this.checkoutService.getState().data;
        const cart = state.getCart();
        const storeProfile = state.getConfig()?.storeProfile;
        const isGuestCustomer = state.getCustomer()?.isGuest;

        const paymentMethod =
            state.getPaymentMethod('braintreeacceleratedcheckout') ||
            state.getPaymentMethod('braintree');
        const isTestTreatmentGroup = paymentMethod?.initializationData.shouldRunAcceleratedCheckout;

        const experiments = [
            {
                treatment_group: isTestTreatmentGroup ? 'test' : 'control',
            },
        ];

        return {
            context_type: 'cs_id',
            context_id: cart?.id || '',
            page_type: 'checkout_page',
            page_name: window.document.title,
            partner_name: 'bigc',
            user_type: isGuestCustomer ? 'store_guest' : 'store_member',
            store_id: storeProfile?.storeId || '',
            merchant_name: storeProfile?.storeName || '',
            experiment: JSON.stringify(experiments),
        };
    }

    private _getEmailSubmittedEventOptions(
        isEmailPrefilled = false,
    ): BraintreeConnectEmailEnteredEventOptions {
        const state = this.checkoutService.getState().data;
        const paymentMethods = state.getPaymentMethods() || [];
        const apmList = paymentMethods.map(({ id }) => id);

        return {
            ...this._getEventCommonOptions(),
            user_email_saved: isEmailPrefilled,
            apm_shown: apmList.length > 1 ? '1' : '0',
            apm_list: apmList.join(','),
        };
    }

    private _getApmSelectedEventOptions(
        methodId: string,
        isWalletButton: boolean,
    ): BraintreeConnectApmSelectedEventOptions {
        const state = this.checkoutService.getState().data;
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

    private _getOrderPlacedEventOptions(methodId: string): BraintreeConnectOrderPlacedEventOptions {
        const state = this.checkoutService.getState().data;
        const cart = state.getCart();

        return {
            ...this._getEventCommonOptions(),
            selected_payment_method: methodId,
            currency_code: cart?.currency.code || '',
        };
    }
}
