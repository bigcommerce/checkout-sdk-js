import HostedInputStorage from './hosted-input-storage';

describe('HostedInputStorage', () => {
    let subject: HostedInputStorage;

    beforeEach(() => {
        subject = new HostedInputStorage();
    });

    it('sets nonce for later retrieval', () => {
        subject.setNonce('abc');

        expect(subject.getNonce())
            .toEqual('abc');
    });
});
