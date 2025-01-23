import createStoredCardHostedFormService from './create-hosted-form-stored-card-service';
import StoredCardHostedFormService from './stored-card-hosted-form-service';

describe('createStoredCardHostedFormService()', () => {
    it('returns an instance of StoredCardHostedFormService', () => {
        const service = createStoredCardHostedFormService('https://bigpay.integration.zone');

        expect(service).toBeInstanceOf(StoredCardHostedFormService);
    });
});
