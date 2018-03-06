import { getErrorResponse } from '../common/http-request/responses.mock';
import { getRemoteCheckoutState, getEmptyRemoteCheckoutState } from './remote-checkout.mock';
import RemoteCheckoutSelector from './remote-checkout-selector';

describe('RemoteCheckoutSelector', () => {
    it('returns remote checkout data', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getCheckout()).toEqual(remoteCheckout.data);
    });

    it('returns undefined if checkout data is unavailable', () => {
        const remoteCheckout = getEmptyRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getCheckout()).toBeUndefined();
    });

    it('returns remote checkout meta', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getCheckoutMeta()).toEqual(remoteCheckout.meta);
    });

    it('returns undefined if checkout meta is unavailable', () => {
        const remoteCheckout = getEmptyRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getCheckoutMeta()).toBeUndefined();
    });

    it('returns billing initialization error', () => {
        const remoteCheckout = {
            ...getRemoteCheckoutState(),
            errors: { initializeBillingError: getErrorResponse() },
        };
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getInitializeBillingError()).toEqual(getErrorResponse());
    });

    it('returns undefined if there is no billing initialization error', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getInitializeBillingError()).toBeUndefined();
    });

    it('returns shipping initialization error', () => {
        const remoteCheckout = {
            ...getRemoteCheckoutState(),
            errors: { initializeShippingError: getErrorResponse() },
        };
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getInitializeShippingError()).toEqual(getErrorResponse());
    });

    it('returns undefined if there is no shipping initialization error', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getInitializeShippingError()).toBeUndefined();
    });

    it('returns payment initialization error', () => {
        const remoteCheckout = {
            ...getRemoteCheckoutState(),
            errors: { initializePaymentError: getErrorResponse() },
        };
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getInitializePaymentError()).toEqual(getErrorResponse());
    });

    it('returns undefined if there is no sign out error', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getSignOutError()).toBeUndefined();
    });

    it('returns sign out error', () => {
        const remoteCheckout = {
            ...getRemoteCheckoutState(),
            errors: { signOutError: getErrorResponse() },
        };
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getSignOutError()).toEqual(getErrorResponse());
    });

    it('returns undefined if there is no payment initialization error', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.getInitializePaymentError()).toBeUndefined();
    });

    it('returns true if initializing billing', () => {
        const remoteCheckout = {
            ...getRemoteCheckoutState(),
            statuses: { isInitializingBilling: true },
        };
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.isInitializingBilling()).toEqual(true);
    });

    it('returns false if not initializing billing', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.isInitializingBilling()).toEqual(false);
    });

    it('returns true if initializing shipping', () => {
        const remoteCheckout = {
            ...getRemoteCheckoutState(),
            statuses: { isInitializingShipping: true },
        };
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.isInitializingShipping()).toEqual(true);
    });

    it('returns false if not initializing billing', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.isInitializingShipping()).toEqual(false);
    });

    it('returns true if initializing any payment method', () => {
        const remoteCheckout = {
            ...getRemoteCheckoutState(),
            statuses: { isInitializingPayment: true },
        };
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.isInitializingPayment()).toEqual(true);
    });

    it('returns false if not initializing any payment method', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.isInitializingPayment()).toEqual(false);
    });

    it('returns true if initializing payment method', () => {
        const remoteCheckout = {
            ...getRemoteCheckoutState(),
            statuses: { isInitializingPayment: true, loadingPaymentMethod: 'foo' },
        };
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.isInitializingPayment('foo')).toEqual(true);
        expect(selector.isInitializingPayment('bar')).toEqual(false);
    });

    it('returns true if signing out', () => {
        const remoteCheckout = {
            ...getRemoteCheckoutState(),
            statuses: { isSigningOut: true },
        };
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.isSigningOut()).toEqual(true);
    });

    it('returns false if not signing out', () => {
        const remoteCheckout = getRemoteCheckoutState();
        const selector = new RemoteCheckoutSelector(remoteCheckout);

        expect(selector.isSigningOut()).toEqual(false);
    });
});
