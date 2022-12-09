import { legacyIntegration } from './legacy-integration';

describe('legacyIntegration', () => {
    it('should work', () => {
        expect(legacyIntegration()).toEqual('legacy-integration');
    });
});
