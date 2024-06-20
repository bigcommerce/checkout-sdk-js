import {
    BraintreeFastlane,
    BraintreeFastlaneApmSelectedEventOptions,
    BraintreeFastlaneEmailEnteredEventOptions,
    BraintreeFastlaneEventCommonOptions,
    BraintreeFastlaneOrderPlacedEventOptions,
    isBraintreeFastlaneWindow,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import { PaymentMethodClientUnavailableError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutService } from '../../checkout';

import BraintreeAnalyticTrackerService from './braintree-analytic-tracker-service';

export default class BraintreeAnalyticTracker implements BraintreeAnalyticTrackerService {
    private _selectedPaymentMethodId = '';

    constructor(private checkoutService: CheckoutService) {}

    customerPaymentMethodExecuted() {
        if (this._shouldTrackFastlaneEvent()) {
            this._trackEmailSubmitted();
        }
    }

    paymentComplete() {
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

    walletButtonClick(methodId: string) {
        if (this._shouldTrackFastlaneEvent() && methodId) {
            this._selectedPaymentMethodId = methodId;

            this._trackApmSelected(methodId, true);
        }
    }

    private _shouldTrackFastlaneEvent() {
        const state = this.checkoutService.getState();
        const paymentMethod =
            state.data.getPaymentMethod('braintree') ||
            state.data.getPaymentMethod('braintreeacceleratedcheckout');
        const isAnalyticEnabled = paymentMethod?.initializationData.isBraintreeAnalyticsV2Enabled;

        const isAvailableAnalyticEventsMethods =
            isBraintreeFastlaneWindow(window) && window.braintreeFastlane.events;

        return isAnalyticEnabled && isAvailableAnalyticEventsMethods;
    }

    private _getBraintreeEventsOrThrow(): BraintreeFastlane['events'] {
        if (isBraintreeFastlaneWindow(window)) {
            return window.braintreeFastlane.events;
        }

        throw new PaymentMethodClientUnavailableError();
    }

    /**
     *
     * Braintree Events tracking methods
     *
     */
    private _trackEmailSubmitted(): void {
        const { emailSubmitted } = this._getBraintreeEventsOrThrow();
        const eventOptions = this._getEmailSubmittedEventOptions();

        emailSubmitted(eventOptions);
    }

    private _trackApmSelected(methodId: string, isWalletButton: boolean): void {
        const { apmSelected } = this._getBraintreeEventsOrThrow();
        const eventOptions = this._getApmSelectedEventOptions(methodId, isWalletButton);

        apmSelected(eventOptions);
    }

    private _trackOrderPlaced(methodId: string): void {
        const { orderPlaced } = this._getBraintreeEventsOrThrow();
        const eventOptions = this._getOrderPlacedEventOptions(methodId);

        orderPlaced(eventOptions);
    }

    /**
     *
     * Event options methods
     *
     */
    private _getEventCommonOptions(): BraintreeFastlaneEventCommonOptions {
        const state = this.checkoutService.getState();
        const cart = state.data.getCart();
        const storeProfile = state.data.getConfig()?.storeProfile;
        const isGuestCustomer = state.data.getCustomer()?.isGuest;

        const paymentMethod = state.data.getPaymentMethod('braintreeacceleratedcheckout');
        const isTestTreatmentGroup =
            !state.errors.getLoadPaymentMethodError('braintreeacceleratedcheckout') &&
            paymentMethod?.initializationData.shouldRunAcceleratedCheckout;

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

    private _getEmailSubmittedEventOptions(): BraintreeFastlaneEmailEnteredEventOptions {
        const state = this.checkoutService.getState().data;
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
    ): BraintreeFastlaneApmSelectedEventOptions {
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

    private _getOrderPlacedEventOptions(
        methodId: string,
    ): BraintreeFastlaneOrderPlacedEventOptions {
        const state = this.checkoutService.getState().data;
        const cart = state.getCart();

        return {
            ...this._getEventCommonOptions(),
            selected_payment_method: methodId,
            currency_code: cart?.currency.code || '',
        };
    }
}
