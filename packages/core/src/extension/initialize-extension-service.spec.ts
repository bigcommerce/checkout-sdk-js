import { InitializeExtensionServiceOptions } from './extension-client';
import ExtensionService from './extension-service';
import initializeExtensionService from './initialize-extension-service';

describe('initializeExtensionService', () => {
    it('initializes extension service correctly', () => {
        const options: InitializeExtensionServiceOptions = {
            extensionId: 'test',
            parentOrigin: 'https://test.com',
        };

        const extensionService = initializeExtensionService(options);

        expect(extensionService).toBeInstanceOf(ExtensionService);
    });
});
