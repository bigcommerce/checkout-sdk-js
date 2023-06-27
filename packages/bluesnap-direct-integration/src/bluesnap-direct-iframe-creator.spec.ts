import { createIframe } from './bluesnap-direct-iframe-creator';

describe('BlueSnapDirectAPMPaymentStrategy', () => {
    it('creates iframe with styleprops', () => {
        const iframe: HTMLIFrameElement = createIframe(
            'bluesnapdirect_hosted_payment_page',
            'https://sandbox.bluesnap.com/buynow/checkout?enc=test',
            { border: '1px solid gray', height: '40vh', width: '100%' },
        );

        expect(iframe).toHaveProperty('style');
        expect(iframe.name).toBe('bluesnapdirect_hosted_payment_page');
        expect(iframe.src).toBe('https://sandbox.bluesnap.com/buynow/checkout?enc=test');
        expect(iframe.style.height).toBe('40vh');
        expect(iframe.style.border).toBe('1px solid gray');
        expect(iframe.style.width).toBe('100%');
    });

    it('creates iframe without styleprops', () => {
        const iframe: HTMLIFrameElement = createIframe(
            'bluesnapdirect_hosted_payment_page',
            'https://sandbox.bluesnap.com/buynow/checkout?enc=test',
        );

        expect(iframe).toHaveProperty('style');
        expect(iframe.name).toBe('bluesnapdirect_hosted_payment_page');
        expect(iframe.src).toBe('https://sandbox.bluesnap.com/buynow/checkout?enc=test');
        expect(iframe.style.height).toBe('');
    });
});
