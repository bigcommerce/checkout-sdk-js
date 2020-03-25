import getOverlayStyle from './overlay-style';

export interface OverlayOptions {
    background?: string;
    id?: string;
    transitionDuration?: number;
    hasCloseButton?: boolean;
    innerHtml?: HTMLElement | DocumentFragment;
}

export interface OverlayShowOptions {
    onClick?(event: MouseEvent): void;
    onClickClose?(event: MouseEvent): void;
}

export interface Elements {
    element: HTMLElement;
    mainElement: HTMLElement;
    closeElement?: HTMLElement;
}

export default class Overlay {
    private _element: HTMLElement;
    private _mainElement: HTMLElement;
    private _closeElement?: HTMLElement;
    private _unregisterClick?: () => void;

    constructor(options?: OverlayOptions) {
        const { element, closeElement, mainElement } = this._createElements(options);

        this._element = element;
        this._closeElement = closeElement;
        this._mainElement = mainElement;
    }

    show(options?: OverlayShowOptions): void {

        if (this._mainElement.parentElement) {
            return;
        }

        this._registerClick(options);

        document.body.appendChild(this._mainElement);

        // Fade In
        setTimeout(() => this._element.style.opacity = '1');
    }

    remove(): void {
        if (!this._mainElement.parentElement) {
            return;
        }

        if (this._unregisterClick) {
            this._unregisterClick();
        }

        this._removeAfterTransition();

        setTimeout(() => this._element.style.opacity = '0');
    }

    private _createElements(options?: OverlayOptions): Elements {
        const element = document.createElement('div');
        const {
            background = 'rgba(0, 0, 0, 0.8)',
            id = 'checkoutOverlay',
            transitionDuration = 400,
            hasCloseButton,
            innerHtml,
        } = options || {};
        let mainElement = element;
        let closeElement: HTMLElement | undefined;
        let classLayout: string | undefined;
        let classClose: string | undefined;
        let classOverlayText: string | undefined;

        if (id) {
            element.id = id;
        }

        if (innerHtml) {
            const overlayText = document.createElement('div');
            classOverlayText = `${id}--overlayText`;
            overlayText.className = classOverlayText;
            overlayText.appendChild(innerHtml);

            element.appendChild(overlayText);
        }

        if (hasCloseButton) {
            classClose = `${id}--close`;
            closeElement = document.createElement('div');
            closeElement.className =  classClose;

            classLayout = `${id}--layout`;
            mainElement = document.createElement('div');
            mainElement.className = classLayout;

            mainElement.appendChild(element);
            mainElement.appendChild(closeElement);
        }

        mainElement.appendChild(getOverlayStyle({ id, background, transitionDuration, classLayout, classOverlayText, classClose }));

        return { element, closeElement, mainElement };
    }

    private _addEventListener(element?: HTMLElement, onClick?: (event: MouseEvent) => void): void {
        if (!element || !onClick) {
           return;
        }

        element.addEventListener('click', onClick);
    }

    private _removeEventListener(element?: HTMLElement, onClick?: (event: MouseEvent) => void): void {
        if (!element || !onClick) {
            return;
        }

        element.removeEventListener('click', onClick);
    }

    private _registerClick(options?: OverlayShowOptions): void {
        if (this._unregisterClick) {
            this._unregisterClick();
        }

        if (options) {
            const { onClick, onClickClose } = options;

            this._addEventListener(this._element, onClick);
            this._addEventListener(this._closeElement, onClickClose);

            this._unregisterClick = () => {
                this._removeEventListener(this._element, onClick);
                this._removeEventListener(this._closeElement, onClickClose);
                this._unregisterClick = undefined;
            };
        }
    }

    private _removeAfterTransition(): void {
        const handleTransition: (event: Event) => void = event => {
            // NOTE: `event` is not correctly typed in this version of TS
            if ((event as TransitionEvent).propertyName !== 'opacity') {
                return;
            }

            if (this._mainElement.parentElement) {
                this._mainElement.remove();
            }

            this._element.removeEventListener('transitionend', handleTransition);
        };

        this._element.addEventListener('transitionend', handleTransition);
    }
}
