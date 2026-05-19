import { B2BCompanyPaymentMethodsResponseBody } from './b2b-company-payment-method-request-sender';
import PaymentMethod from './payment-method';

/**
 * Intersects the storefront payment method list against a B2B company's
 * allow-list. Matches on `PaymentMethod.id === b2bMethod.code` and drops
 * disabled methods (`isEnabled !== '1'`).
 *
 * Temporary ACL: remove once the B2B Storefront API returns a pre-filtered list.
 */
export default function filterPaymentMethodsByB2BCompanyAllowList(
    methods: PaymentMethod[],
    body: B2BCompanyPaymentMethodsResponseBody,
): PaymentMethod[] {
    const allowedCodes = new Set(body.data.filter((m) => m.isEnabled === '1').map((m) => m.code));

    return methods.filter((method) => allowedCodes.has(method.id));
}
