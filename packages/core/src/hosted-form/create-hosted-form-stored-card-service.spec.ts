import createHostedFormStoredCardService from './create-hosted-form-stored-card-service';
import HostedFormStoredCardService from './hosted-form-stored-card-service';

describe('createHostedFormStoredCardService()', () => {
    it('returns an instance of HostedFormStoredCardService', () => {
        const service = createHostedFormStoredCardService('https://bigpay.integration.zone');

        expect(service).toBeInstanceOf(HostedFormStoredCardService);
    });
});
