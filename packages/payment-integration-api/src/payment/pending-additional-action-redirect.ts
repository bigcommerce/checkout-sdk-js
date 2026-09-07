const STORAGE_KEY = 'bc-checkout-pending-additional-action-redirect';

/**
 * Some payment methods (e.g. Google Pay, Adyen v3) resolve a 3DS / additional
 * action challenge via a full-page browser redirect to the issuer's ACS page,
 * rather than an in-page iframe or modal. That redirect tears down the whole
 * JS session, so there's no in-memory way to tell, once the browser lands
 * back on checkout, whether we're returning from such a challenge - and the
 * order/payment status the storefront reports at that point may not yet have
 * advanced past its initial, pre-attempt state either.
 *
 * Persist a short-lived marker in sessionStorage right before the redirect so
 * a payment strategy's `finalize()` can recognise this case on return, and
 * decide to check the real outcome with BigPay instead of assuming there's
 * nothing to finalize.
 */
export function markPendingAdditionalActionRedirect(methodId: string): void {
    try {
        window.sessionStorage.setItem(STORAGE_KEY, methodId);
    } catch {
        // sessionStorage may be unavailable (e.g. private browsing) - ignore.
    }
}

export function consumePendingAdditionalActionRedirect(methodId?: string): boolean {
    try {
        const pendingMethodId = window.sessionStorage.getItem(STORAGE_KEY);

        window.sessionStorage.removeItem(STORAGE_KEY);

        return !!methodId && pendingMethodId === methodId;
    } catch {
        return false;
    }
}
