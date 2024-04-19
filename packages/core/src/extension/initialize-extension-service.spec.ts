import ExtensionService from './extension-service';
import initializeExtensionService, {
    InitializeExtensionServiceOptions,
} from './initialize-extension-service';

describe('initializeExtensionService', () => {
    it('initializes extension service correctly', async () => {
        Object.defineProperty(window, 'parentIFrame', {
            value: {
                autoResize: jest.fn(),
                setHeightCalculationMethod: jest.fn(),
            },
        });

        const options: InitializeExtensionServiceOptions = {
            extensionId: 'test',
            parentOrigin: 'https://test.com',
        };

        const extensionService = await initializeExtensionService(options);

        expect(extensionService).toBeInstanceOf(ExtensionService);
    });
});
