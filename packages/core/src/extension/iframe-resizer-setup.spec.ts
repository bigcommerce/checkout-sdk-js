import {
    iframeResizerSetup,
    IframeResizerWindow,
    isIframeResizerWindow,
} from './iframe-resizer-setup';

describe('iframeResizer methods', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'parentIFrame', {
            value: {
                autoResize: jest.fn(),
                setHeightCalculationMethod: jest.fn(),
                size: jest.fn(),
            },
        });
    });

    describe('isIframeResizerWindow', () => {
        it('should return true if window has parentIFrame', () => {
            expect(isIframeResizerWindow(window)).toBe(true);
        });
    });

    describe('iframeResizerSetup', () => {
        it('should call parentIFrame.autoResize(true) and setHeightCalculationMethod("bodyOffset") when fixedHeight is not provided', () => {
            iframeResizerSetup(undefined, undefined);

            expect(
                (window as unknown as IframeResizerWindow).parentIFrame.autoResize,
            ).toHaveBeenCalledWith(true);
            expect(
                (window as unknown as IframeResizerWindow).parentIFrame.setHeightCalculationMethod,
            ).toHaveBeenCalledWith('bodyOffset');
        });

        it('should call setHeightCalculationMethod("taggedElement") when taggedElementId is provided and element exists', () => {
            jest.spyOn(document, 'getElementById').mockReturnValue(document.createElement('div'));

            iframeResizerSetup('div-id', undefined);

            expect(
                (window as unknown as IframeResizerWindow).parentIFrame.setHeightCalculationMethod,
            ).toHaveBeenCalledWith('taggedElement');

            jest.resetAllMocks();
        });

        it('should throw an error when taggedElementId is provided but the element does not exist', () => {
            expect(() => iframeResizerSetup('non-existent-element', undefined)).toThrow(
                'Element not found.',
            );
        });

        it('should call parentIFrame.size with fixedHeight if fixedHeight is provided', () => {
            iframeResizerSetup(undefined, 100);

            expect(
                (window as unknown as IframeResizerWindow).parentIFrame.size,
            ).toHaveBeenCalledWith(100);
        });
    });
});
