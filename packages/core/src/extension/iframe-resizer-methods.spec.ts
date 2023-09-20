import {
    enableAutoResizing,
    IframeResizerWindow,
    isIframeResizerWindow,
} from './iframe-resizer-methods';

describe('iframeResizer methods', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'parentIFrame', {
            value: {
                autoResize: jest.fn(),
                setHeightCalculationMethod: jest.fn(),
            },
        });
    });

    describe('isIframeResizerWindow', () => {
        it('should return true if window has parentIFrame', () => {
            expect(isIframeResizerWindow(window)).toBe(true);
        });
    });

    describe('enableAutoResizing', () => {
        it('should resolve when taggedElementId is provided and element exists', async () => {
            const extensionContent = document.createElement('div');

            extensionContent.id = 'contentId';
            document.body.appendChild(extensionContent);

            const promise = enableAutoResizing('contentId');

            await expect(promise).resolves.toBeUndefined();
            expect(
                (window as unknown as IframeResizerWindow).parentIFrame.autoResize,
            ).toHaveBeenCalledWith(true);
            expect(extensionContent.getAttribute('data-iframe-height')).toBe('');
            expect(
                (window as unknown as IframeResizerWindow).parentIFrame.setHeightCalculationMethod,
            ).toHaveBeenCalledWith('taggedElement');
        });

        it('should reject when taggedElementId is provided but element does not exist', async () => {
            const promise = enableAutoResizing('nonExistentElementId');

            await expect(promise).rejects.toThrow('Element Id not found.');
            expect(
                (window as unknown as IframeResizerWindow).parentIFrame.autoResize,
            ).toHaveBeenCalledWith(true);
            expect(
                (window as unknown as IframeResizerWindow).parentIFrame.setHeightCalculationMethod,
            ).toHaveBeenCalledWith('taggedElement');
        });

        it('should set height calculation method to bodyOffset when taggedElementId is not provided', async () => {
            const promise = enableAutoResizing();

            expect(promise).resolves.toBeUndefined();
            expect(
                (window as unknown as IframeResizerWindow).parentIFrame.autoResize,
            ).toHaveBeenCalledWith(true);
            expect(
                (window as unknown as IframeResizerWindow).parentIFrame.setHeightCalculationMethod,
            ).toHaveBeenCalledWith('bodyOffset');
        });
    });
});
