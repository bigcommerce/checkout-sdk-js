import { B2BCompanyPaymentMethodsResponseBody } from './b2b-company-payment-method-request-sender';
import PaymentMethod from './payment-method';
import { OFFLINE } from './payment-method-types';

const legacyProviderCodeMap: { [methodId: string]: string } = {
    quickbooks: 'qbmsv2',
    elavon: 'myvirtualmerchant',
};

/**
 * A B2B allow-list entry identifies a provider by a single code. To match allowed methods
 * correctly, we need to check id, gateway, and the translated legacy provider ID where
 * the setup code differs from the checkout ID.
 *
 * Creating this helper function because the same logic also applies to the invoice flow.
 */
function matchesAllowedCode(method: PaymentMethod, allowedCodes: Set<string>): boolean {
    const legacyCode = legacyProviderCodeMap[method.id];

    return (
        allowedCodes.has(method.id) ||
        (method.gateway !== undefined && allowedCodes.has(method.gateway)) ||
        (legacyCode !== undefined && allowedCodes.has(legacyCode))
    );
}

export function filterPaymentMethodsByB2BCompanyAllowList(
    methods: PaymentMethod[],
    body: B2BCompanyPaymentMethodsResponseBody,
): PaymentMethod[] {
    const allowedCodes = new Set(body.data.filter((m) => m.isEnabled === '1').map((m) => m.code));

    return methods.filter((method) => matchesAllowedCode(method, allowedCodes));
}

export function filterPaymentMethodsByB2BInvoiceAllowList(
    methods: PaymentMethod[],
    body: { data: { allowedMethods: string[] } },
): PaymentMethod[] {
    const allowedCodes = new Set(body.data.allowedMethods);

    return methods.filter(
        (method) => method.type !== OFFLINE && matchesAllowedCode(method, allowedCodes),
    );
}
