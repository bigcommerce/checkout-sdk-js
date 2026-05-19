import filterPaymentMethodsByB2BCompanyAllowList from './b2b-company-payment-method-filter-transformer';
import { B2BCompanyPaymentMethodsResponseBody } from './b2b-company-payment-method-request-sender';
import PaymentMethod from './payment-method';

function makeMethod(id: string): PaymentMethod {
    return {
        id,
        config: {},
        method: 'credit-card',
        supportedCards: [],
        type: 'PAYMENT_TYPE_API',
        skipRedirectConfirmationAlert: false,
    };
}

describe('filterPaymentMethodsByB2BCompanyAllowList', () => {
    it('returns only methods whose id is in the allow-list', () => {
        const methods = [makeMethod('cheque'), makeMethod('stripev3'), makeMethod('braintree')];
        const body: B2BCompanyPaymentMethodsResponseBody = {
            data: [
                { code: 'cheque', name: 'Check', isEnabled: '1', paymentId: 1 },
                { code: 'stripev3', name: 'Stripe', isEnabled: '1', paymentId: 2 },
            ],
        };

        expect(filterPaymentMethodsByB2BCompanyAllowList(methods, body)).toEqual([
            makeMethod('cheque'),
            makeMethod('stripev3'),
        ]);
    });

    it('drops methods whose B2B entry is disabled', () => {
        const methods = [makeMethod('cheque'), makeMethod('stripev3')];
        const body: B2BCompanyPaymentMethodsResponseBody = {
            data: [
                { code: 'cheque', name: 'Check', isEnabled: '1', paymentId: 1 },
                { code: 'stripev3', name: 'Stripe', isEnabled: '0', paymentId: 2 },
            ],
        };

        expect(filterPaymentMethodsByB2BCompanyAllowList(methods, body)).toEqual([
            makeMethod('cheque'),
        ]);
    });

    it('returns an empty list when the allow-list is empty', () => {
        const methods = [makeMethod('cheque'), makeMethod('stripev3')];
        const body: B2BCompanyPaymentMethodsResponseBody = { data: [] };

        expect(filterPaymentMethodsByB2BCompanyAllowList(methods, body)).toEqual([]);
    });

    it('returns an empty list when the intersection is empty', () => {
        const methods = [makeMethod('cheque'), makeMethod('stripev3')];
        const body: B2BCompanyPaymentMethodsResponseBody = {
            data: [{ code: 'braintree', name: 'Braintree', isEnabled: '1', paymentId: 1 }],
        };

        expect(filterPaymentMethodsByB2BCompanyAllowList(methods, body)).toEqual([]);
    });

    it('preserves the order of the input methods', () => {
        const methods = [makeMethod('stripev3'), makeMethod('braintree'), makeMethod('cheque')];
        const body: B2BCompanyPaymentMethodsResponseBody = {
            data: [
                { code: 'cheque', name: 'Check', isEnabled: '1', paymentId: 1 },
                { code: 'stripev3', name: 'Stripe', isEnabled: '1', paymentId: 2 },
            ],
        };

        expect(filterPaymentMethodsByB2BCompanyAllowList(methods, body)).toEqual([
            makeMethod('stripev3'),
            makeMethod('cheque'),
        ]);
    });
});
