import ExtensionService from './extension-service';
import * as iframeResizerSetupModule from './iframe-resizer-setup';
import initializeExtensionService, {
    InitializeExtensionServiceOptions,
} from './initialize-extension-service';

describe('initializeExtensionService', () => {
    it('initializes extension service correctly', async () => {
        jest.spyOn(iframeResizerSetupModule, 'iframeResizerSetup').mockReturnValue(null);

        Object.defineProperty(window, 'parentIFrame', {
            value: {
                autoResize: jest.fn(),
                setHeightCalculationMethod: jest.fn(),
            },
        });

        const options: InitializeExtensionServiceOptions = {
            extensionId: 'test',
            parentOrigin: 'https://test.com',
            fixedHeight: 100,
            taggedElementId: 'test',
        };

        const extensionService = await initializeExtensionService(options);

        expect(extensionService).toBeInstanceOf(ExtensionService);
        expect(iframeResizerSetupModule.iframeResizerSetup).toHaveBeenCalledWith('test', 100);
    });
});
