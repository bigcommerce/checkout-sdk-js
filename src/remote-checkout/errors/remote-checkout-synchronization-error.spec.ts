import RemoteCheckoutSynchronizationError from './remote-checkout-synchronization-error';

describe('RemoteCheckoutSynchronizationError', () => {
    it('returns error name', () => {
        const error = new RemoteCheckoutSynchronizationError();

        expect(error.name).toEqual('RemoteCheckoutSynchronizationError');
    });
});
