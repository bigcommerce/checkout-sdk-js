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
    private shouldTriggerEventSubmittedEvent: boolean = true;
    private selectedPaymentMethodId: string = 'braintreeacceleratedcheckout';

    constructor(
        private checkoutService: CheckoutService,
    ) {}

    customerPaymentMethodExecuted() {
        if (this.shouldTrackTheEvent()) {
            this.shouldTriggerEventSubmittedEvent = false;

            this.trackEmailSubmitted(false);
        }
    }

    trackStepViewed(step: string) {
        if (this.shouldTrackTheEvent() && this.shouldTriggerEventSubmittedEvent && step !== 'customer' ) {
            this.shouldTriggerEventSubmittedEvent = false;

            this.trackEmailSubmitted(true);
        }
    }

    paymentComplete() {
        if (this.shouldTrackTheEvent()) {
            if (this.shouldTriggerEventSubmittedEvent) {
                this.trackEmailSubmitted(true);
            }

            this.trackOrderPlaced(this.selectedPaymentMethodId);
        }
    }

    selectedPaymentMethod(methodId?: string): void {
        if (this.shouldTrackTheEvent() && methodId) {
            this.selectedPaymentMethodId = methodId;

            this.trackApmSelected(methodId, false);
        }
    }

    walletButtonClick(methodId?: string) {
        if (this.shouldTrackTheEvent() && methodId) {
            this.selectedPaymentMethodId = methodId;

            this.trackApmSelected(methodId, true);
        }
    }


    /**
     *
     * Common
     *
     */
    private shouldTrackTheEvent() {
        return isBraintreeConnectWindow(window) && window.braintreeConnect.events;
    }

    // @ts-ignore
    private getBraintreeConnectEventsOrThrow(): BraintreeConnect['events'] {
        if (isBraintreeConnectWindow(window)) {
            // return window.braintreeConnect.events;

            return {
                orderPlaced: (options: BraintreeConnectOrderPlacedEventOptions) => {
                    console.log('Braintree Connect order placed: ', options);
                },
                emailSubmitted: (options: BraintreeConnectEmailEnteredEventOptions) => {
                    console.log('Braintree Connect email submitted: ', options);
                },
                apmSelected: (options: BraintreeConnectApmSelectedEventOptions) => {
                    console.log('Braintree Connect apm selected: ', options);
                },
            };
        }

        throw new PaymentMethodClientUnavailableError();
    }

    /**
     *
     * Braintree Connect Event track methods
     *
     */
    private trackEmailSubmitted(isEmailPrefilled: boolean): void {
        const { emailSubmitted } = this.getBraintreeConnectEventsOrThrow();
        const eventOptions = this.getEmailSubmittedEventOptions(isEmailPrefilled);

        emailSubmitted(eventOptions);
    }

    private trackApmSelected(methodId: string, isWalletButton: boolean): void {
        const { apmSelected } = this.getBraintreeConnectEventsOrThrow();
        const eventOptions = this.getApmSelectedEventOptions(methodId, isWalletButton);

        apmSelected(eventOptions);
    }

    private trackOrderPlaced(methodId: string): void {
        const { orderPlaced } = this.getBraintreeConnectEventsOrThrow();
        const eventOptions = this.getOrderPlacedEventOptions(methodId);

        orderPlaced(eventOptions);
    }

    /**
     *
     * Event options methods
     *
     */
    private getEventCommonOptions(): BraintreeConnectEventCommonOptions {
        const state = this.checkoutService.getState().data;
        const cart = state.getCart();
        const storeProfile = state.getConfig()?.storeProfile;
        const isGuestCustomer = state.getCustomer()?.isGuest;

        const paymentMethod =
            state.getPaymentMethod('braintreeacceleratedcheckout')
            || state.getPaymentMethod('braintree');
        const isTestTreatmentGroup = paymentMethod?.initializationData.shouldRunAcceleratedCheckout;

        const experiments = [
            {
                treatment_group: isTestTreatmentGroup ? 'test' : 'control',
            }
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

    private getEmailSubmittedEventOptions(isEmailPrefilled = false): BraintreeConnectEmailEnteredEventOptions {
        const state = this.checkoutService.getState().data;
        const paymentMethods = state.getPaymentMethods() || [];
        const apmList = paymentMethods.map(({ id }) => id).join(',');

        return {
            ...this.getEventCommonOptions(),
            user_email_saved: isEmailPrefilled,
            apm_shown: apmList.length > 1 ? '1' : '0',
            apm_list: apmList,
        };
    }

    private getApmSelectedEventOptions(methodId: string, isWalletButton: boolean): BraintreeConnectApmSelectedEventOptions {
        const state = this.checkoutService.getState().data;
        const paymentMethods = state.getPaymentMethods() || [];
        const apmList = paymentMethods.map(({ id }) => id).join(',');

        return {
            ...this.getEventCommonOptions(),
            apm_shown: apmList.length > 1 ? '1' : '0',
            apm_list: apmList,
            apm_selected: methodId,
            apm_location: isWalletButton ? 'pre-email section' : 'payment section',
        };
    }

    private getOrderPlacedEventOptions(methodId: string): BraintreeConnectOrderPlacedEventOptions {
        const state = this.checkoutService.getState().data;
        const cart = state.getCart();

        return {
            ...this.getEventCommonOptions(),
            selected_payment_method: methodId,
            currency_code: cart?.currency.code || '',
        };
    }
}
