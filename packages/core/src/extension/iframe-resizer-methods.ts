export interface IframeResizerWindow extends Window {
    parentIFrame: {
        autoResize: (isEnabled: boolean) => void;
        setHeightCalculationMethod: (id: string) => void;
    };
}

export function isIframeResizerWindow(window: Window): window is IframeResizerWindow {
    const iframeResizerWindow: IframeResizerWindow = window as IframeResizerWindow;

    return !!iframeResizerWindow.parentIFrame;
}

export async function enableAutoResizing(taggedElementId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const waitingForIframeResizer = () => {
            if (isIframeResizerWindow(window)) {
                window.parentIFrame.autoResize(true);

                if (taggedElementId) {
                    const element = document.getElementById(taggedElementId);

                    if (element) {
                        element.setAttribute('data-iframe-height', '');
                        window.parentIFrame.setHeightCalculationMethod('taggedElement');

                        resolve();
                    }

                    reject(new Error(`Element Id not found.`));
                } else {
                    window.parentIFrame.setHeightCalculationMethod('bodyOffset');

                    resolve();
                }
            } else {
                setTimeout(waitingForIframeResizer, 100);
            }
        };

        waitingForIframeResizer();
    });
}
