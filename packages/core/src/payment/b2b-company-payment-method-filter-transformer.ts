import { B2BCompanyPaymentMethodsResponseBody } from './b2b-company-payment-method-request-sender';
import PaymentMethod from './payment-method';

const legacyProviderCodeMap: { [methodId: string]: string } = {
    quickbooks: 'qbmsv2',
    elavon: 'myvirtualmerchant',
};

/**
 * Intersects the storefront payment method list against a B2B company's
 * allow-list. A method is kept when `b2bMethod.code` matches its
 * `PaymentMethod.id`, its `PaymentMethod.gateway` (gateway-based providers are
 * registered under the gateway code, e.g. `credit_card`/`bluesnapdirect`), or
 * the translation of a legacy provider ID whose setup code differs from its
 * checkout ID. Disabled methods (`isEnabled !== '1'`) are dropped.
 */
export default function filterPaymentMethodsByB2BCompanyAllowList(
    methods: PaymentMethod[],
    body: B2BCompanyPaymentMethodsResponseBody,
): PaymentMethod[] {
    const allowedCodes = new Set(body.data.filter((m) => m.isEnabled === '1').map((m) => m.code));

    return methods.filter((method) => {
        const legacyCode = legacyProviderCodeMap[method.id];

        return (
            allowedCodes.has(method.id) ||
            (method.gateway !== undefined && allowedCodes.has(method.gateway)) ||
            (legacyCode !== undefined && allowedCodes.has(legacyCode))
        );
    });
}
