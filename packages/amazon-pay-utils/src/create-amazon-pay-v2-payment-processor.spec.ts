import AmazonPayV2PaymentProcessor from './amazon-pay-v2-payment-processor';
import AmazonPayV2ScriptLoader from './amazon-pay-v2-script-loader';
import createAmazonPayV2PaymentProcessor from './create-amazon-pay-v2-payment-processor';

jest.mock('./amazon-pay-v2-payment-processor');

beforeEach(() => {
    (AmazonPayV2PaymentProcessor as jest.Mock<AmazonPayV2PaymentProcessor>).mockClear();
});

describe('createAmazonPayV2PaymentProcessor()', () => {
    it('returns an instance of AmazonPayV2PaymentProcessor', () => {
        const processor = createAmazonPayV2PaymentProcessor();

        expect(processor).toBeInstanceOf(AmazonPayV2PaymentProcessor);
        expect(AmazonPayV2PaymentProcessor).toHaveBeenNthCalledWith(
            1,
            expect.any(AmazonPayV2ScriptLoader),
        );
    });
});
