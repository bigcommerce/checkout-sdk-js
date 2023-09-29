export interface IframeResizerWindow extends Window {
    parentIFrame: {
        autoResize: (isEnabled: boolean) => void;
        setHeightCalculationMethod: (id: string) => void;
        size: (height: number) => void;
    };
}

export function isIframeResizerWindow(window: Window): window is IframeResizerWindow {
    return 'parentIFrame' in window;
}

export function iframeResizerSetup(
    taggedElementId: string | undefined,
    fixedHeight: number | undefined,
): void {
    if (!isIframeResizerWindow(window)) {
        throw new Error('iFramerResizer window not found.');
    }

    if (fixedHeight) {
        window.parentIFrame.size(fixedHeight);
    } else {
        window.parentIFrame.autoResize(true);

        if (taggedElementId) {
            const element = document.getElementById(taggedElementId);

            if (!element) {
                throw new Error(`Element not found.`);
            }

            element.setAttribute('data-iframe-height', '');
            window.parentIFrame.setHeightCalculationMethod('taggedElement');
        } else {
            window.parentIFrame.setHeightCalculationMethod('bodyOffset');
        }
    }
}
