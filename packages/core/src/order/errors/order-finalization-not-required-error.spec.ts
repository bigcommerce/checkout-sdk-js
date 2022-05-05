import OrderFinalizationNotRequiredError from './order-finalization-not-required-error';

describe('OrderFinalizationNotRequiredError', () => {
    it('returns error name', () => {
        const error = new OrderFinalizationNotRequiredError();

        expect(error.name).toEqual('OrderFinalizationNotRequiredError');
    });
});
