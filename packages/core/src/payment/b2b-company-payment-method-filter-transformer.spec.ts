import {
    filterPaymentMethodsByB2BCompanyAllowList,
    filterPaymentMethodsByB2BInvoiceAllowList,
} from './b2b-company-payment-method-filter-transformer';
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

function makeGatewayMethod(id: string, gateway: string): PaymentMethod {
    return { ...makeMethod(id), gateway };
}

const blueSnapDirect = makeGatewayMethod('credit_card', 'bluesnapdirect');
const worldpayAccess = makeGatewayMethod('credit_card', 'worldpayaccess');

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

    it('maps quickbooks to qbmsv2 when matching against the allow-list', () => {
        const methods = [makeMethod('quickbooks')];
        const body: B2BCompanyPaymentMethodsResponseBody = {
            data: [{ code: 'qbmsv2', name: 'QuickBooks', isEnabled: '1', paymentId: 1 }],
        };

        expect(filterPaymentMethodsByB2BCompanyAllowList(methods, body)).toEqual(methods);
    });

    it('maps elavon to myvirtualmerchant when matching against the allow-list', () => {
        const methods = [makeMethod('elavon')];
        const body: B2BCompanyPaymentMethodsResponseBody = {
            data: [{ code: 'myvirtualmerchant', name: 'Elavon', isEnabled: '1', paymentId: 1 }],
        };

        expect(filterPaymentMethodsByB2BCompanyAllowList(methods, body)).toEqual(methods);
    });

    it('matches a legacy provider on its raw code as well as its mapped code', () => {
        const methods = [makeMethod('quickbooks'), makeMethod('elavon')];
        const body: B2BCompanyPaymentMethodsResponseBody = {
            data: [
                { code: 'quickbooks', name: 'QuickBooks', isEnabled: '1', paymentId: 1 },
                { code: 'elavon', name: 'Elavon', isEnabled: '1', paymentId: 2 },
            ],
        };

        expect(filterPaymentMethodsByB2BCompanyAllowList(methods, body)).toEqual(methods);
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

    describe('matching on gateway', () => {
        it('keeps a method whose gateway is allow-listed', () => {
            const body: B2BCompanyPaymentMethodsResponseBody = {
                data: [
                    {
                        code: 'bluesnapdirect',
                        name: 'BlueSnap Direct',
                        isEnabled: '1',
                        paymentId: 59126,
                    },
                ],
            };

            expect(filterPaymentMethodsByB2BCompanyAllowList([blueSnapDirect], body)).toEqual([
                blueSnapDirect,
            ]);
        });

        it('drops a method whose gateway record is disabled', () => {
            const body: B2BCompanyPaymentMethodsResponseBody = {
                data: [
                    {
                        code: 'bluesnapdirect',
                        name: 'BlueSnap Direct',
                        isEnabled: '0',
                        paymentId: 59126,
                    },
                ],
            };

            expect(filterPaymentMethodsByB2BCompanyAllowList([blueSnapDirect], body)).toEqual([]);
        });

        it('distinguishes two providers sharing the credit_card method id', () => {
            const methods = [worldpayAccess, blueSnapDirect];
            const body: B2BCompanyPaymentMethodsResponseBody = {
                data: [
                    {
                        code: 'bluesnapdirect',
                        name: 'BlueSnap Direct',
                        isEnabled: '1',
                        paymentId: 59126,
                    },
                    {
                        code: 'worldpayaccess',
                        name: 'Access Worldpay',
                        isEnabled: '0',
                        paymentId: 52099,
                    },
                ],
            };

            expect(filterPaymentMethodsByB2BCompanyAllowList(methods, body)).toEqual([
                blueSnapDirect,
            ]);
        });

        it('keeps every provider sharing a method id when that id is allow-listed', () => {
            const methods = [worldpayAccess, blueSnapDirect];
            const body: B2BCompanyPaymentMethodsResponseBody = {
                data: [
                    {
                        code: 'credit_card',
                        name: 'Access Worldpay',
                        isEnabled: '1',
                        paymentId: 58757,
                    },
                ],
            };

            expect(filterPaymentMethodsByB2BCompanyAllowList(methods, body)).toEqual(methods);
        });
    });
});

describe('filterPaymentMethodsByB2BInvoiceAllowList', () => {
    it('returns only methods whose id is in the allow-list', () => {
        const methods = [makeMethod('cheque'), makeMethod('stripev3'), makeMethod('braintree')];
        const body = {
            data: { allowedMethods: ['cheque', 'stripev3'] },
        };

        expect(filterPaymentMethodsByB2BInvoiceAllowList(methods, body)).toEqual([
            makeMethod('cheque'),
            makeMethod('stripev3'),
        ]);
    });

    it('returns an empty list when the allow-list is empty', () => {
        const methods = [makeMethod('cheque'), makeMethod('stripev3')];
        const body = {
            data: { allowedMethods: [] },
        };

        expect(filterPaymentMethodsByB2BInvoiceAllowList(methods, body)).toEqual([]);
    });

    it('keeps a method whose gateway is allow-listed', () => {
        const body = {
            data: { allowedMethods: ['bluesnapdirect'] },
        };

        expect(filterPaymentMethodsByB2BInvoiceAllowList([blueSnapDirect], body)).toEqual([
            blueSnapDirect,
        ]);
    });

    it('distinguishes two providers sharing the credit_card method id', () => {
        const methods = [worldpayAccess, blueSnapDirect];
        const body = {
            data: { allowedMethods: ['bluesnapdirect'] },
        };

        expect(filterPaymentMethodsByB2BInvoiceAllowList(methods, body)).toEqual([blueSnapDirect]);
    });

    it('matches a legacy provider on its mapped code', () => {
        const methods = [makeMethod('quickbooks')];
        const body = {
            data: { allowedMethods: ['qbmsv2'] },
        };

        expect(filterPaymentMethodsByB2BInvoiceAllowList(methods, body)).toEqual(methods);
    });
});
