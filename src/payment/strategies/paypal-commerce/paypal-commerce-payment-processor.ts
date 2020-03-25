import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { Overlay } from '../../../common/overlay';

const modalWidth = 450;
const modalHeight = 600;

export interface ProcessorOptions {
    overlay?: {
        helpText?: string;
        continueText?: string;
    };
}

export default class PaypalCommercePaymentProcessor {
    private _window = window;
    private _popup?: WindowProxy | null;
    private _overlay?: Overlay;

    constructor() {}

    initialize({ overlay }: ProcessorOptions) {
        this._overlay = new Overlay({ hasCloseButton: true, innerHtml: this._getOverlayElements(overlay) });
    }

    paymentPayPal(approveUrl: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const paramsWindow =  this._getParamsWindow();

            const closeWindow = (isResolve: boolean, isRemoveOverlay: boolean = true) => {
                this._window.removeEventListener('message', messageHandler);

                if (this._popup) {
                    this._popup.close();
                    this._popup = undefined;
                }

                if (isRemoveOverlay && this._overlay) {
                    this._overlay.remove();
                }

                isResolve
                    ? resolve(true)
                    : reject(new MissingDataError(MissingDataErrorType.MissingPayment));
            };

            const messageHandler = (event: MessageEvent) => {
                if (event.origin !== 'https://www.sandbox.paypal.com' && event.origin !== 'https://www.paypal.com') {
                    return;
                }

                const data = JSON.parse(event.data);

                if (data.operation === 'return_to_merchant' && data.updateParent) {
                    this._window.removeEventListener('message', messageHandler);
                    closeWindow(true);
                }
            };

            this._window.addEventListener('message', messageHandler);
            this._popup = this._window.open(approveUrl, 'PPFrame', paramsWindow);

            const popupTick = setInterval(() => {
                if (!this._popup || this._popup.closed) {
                    clearInterval(popupTick);

                    closeWindow(false);
                }
            }, 500);

            if (this._overlay) {
                this._overlay.show({
                    onClick: () => this._popup ? this._popup.focus() : closeWindow(false),
                    onClickClose: () => closeWindow(false, false),
                });
            }
        });
    }

    deinitialize(): void {
        this._overlay = undefined;
    }

    private _getOverlayElements(options: ProcessorOptions['overlay'] = {}): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const helpText = document.createElement('div');
        const continueText = document.createElement('strong');

        helpText.className = 'paypal-commerce-overlay_text';
        helpText.innerText = options.helpText || 'Don\'t see the secure PayPal browser? We\'ll help you re-launch the window to complete your flow. You might need to enable pop-ups in your browser in order to continue.';

        continueText.className = 'paypal-commerce-overlay_link';
        continueText.innerText = options.continueText || 'Click to continue';
        continueText.style.marginTop = '15px';
        continueText.style.display = 'block';
        continueText.style.color = 'white';
        continueText.style.textDecoration = 'underline';

        fragment.appendChild(helpText);
        fragment.appendChild(continueText);

        return fragment;
    }

    private _getParamsWindow(): string {
        return `
            left=${Math.round((window.screen.height - modalWidth) / 2)},
            top=${Math.round((window.screen.width - modalHeight) / 2)},
            height=${modalHeight},width=${modalWidth},status=yes,toolbar=no,menubar=no,resizable=yes,scrollbars=no
        `;
    }
}
