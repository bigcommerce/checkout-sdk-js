import { createSezzlePaymentStrategy } from './index';

describe('createExternalPaymentStrategy', () => {
    it('instantiates external payment strategy', () => {
        expect(typeof createSezzlePaymentStrategy).toBe('function');
    });
});
