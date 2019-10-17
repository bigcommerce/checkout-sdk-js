import { noop } from 'lodash';

import { Overlay } from '../overlay';

export interface ModalOptions {
    style?: ModalStyleOptions;
    id?: string;
    transitionDuration?: number;
    contentsId?: string;
}

export interface ModalStyleOptions {
    className?: string;
}

export interface ModalShowOptions {
    showCloseButton?: boolean;
    openCallback?(): void;
    closeCallback?(): void;
}

export default class Modal {
    private _element: HTMLElement;
    private _closeCallback?: () => void;
    private overlay: Overlay;
    private _closeButton!: HTMLElement;

    constructor(options?: ModalOptions) {
        this._element = this._createElement(options);
        this.overlay = new Overlay({ zIndex: 3000 });
    }

    open(options?: ModalShowOptions): void {
        const { closeCallback, openCallback, showCloseButton  } = options || {};

        if (!showCloseButton) {
            this.hideCloseButton();
        }

        this._closeCallback = closeCallback || noop ;

        if (openCallback) {
            openCallback();
        }

        this.overlay.show();

        setTimeout(() => this._element.style.opacity = '1');
        setTimeout(() => this._element.style.display = 'block');
    }

    close(): void {
        if (this._closeCallback) {
            this._closeCallback();
        }

        this.overlay.remove();

        setTimeout(() => this._element.style.opacity = '0');
        setTimeout(() => this._element.style.display = 'none');
    }

    showCloseButton(): void {
        this._closeButton.style.display = 'block';
    }

    hideCloseButton(): void {
        this._closeButton.style.display = 'none';
    }

    unmount(): void {
        if (this._closeButton && this._closeButton.parentElement) {
            this._closeButton.removeEventListener('click', () => this.close());
            this._closeButton.parentElement.removeChild(this._closeButton);
        }

        if (this._element.parentElement) {
            this._element.parentElement.removeChild(this._element);
        }

        if (this._closeCallback) {
            this._closeCallback = undefined;
        }

        if (this.overlay) {
            this.overlay.remove();
        }
    }

    private _createElement(options?: ModalOptions): HTMLElement {
        const element = document.createElement('div');
        const {
            style = {},
            id = null,
            transitionDuration = 400,
            contentsId = '',
        } = options || {};

        element.style.display = 'none';
        element.style.opacity = '0';
        element.style.position = 'fixed';
        element.style.zIndex = '4000';

        if (!style.className) {
            element.style.transition = `opacity ${transitionDuration}ms ease-out`;
            element.style.top = '50%';
            element.style.left = '50%';
            element.style.transform = 'translate(-50%, -50%)';
            element.style.width = 'fit-content';
            element.style.minWidth = '30%';
            element.style.height = 'fit-content';
            element.style.minHeight = '100px';
            element.style.backgroundColor = 'white';
            element.style.padding = '10px';
        } else {
            element.className = style.className || '';
        }

        if (id) {
            element.id = id;
        }

        this._closeButton = this._createCloseButton();
        const contents = this._createContents(contentsId);

        element.appendChild(this._closeButton);
        element.appendChild(contents);
        document.body.appendChild(element);

        return element;
    }

    private _createCloseButton(): HTMLElement {
        const element = document.createElement('button');
        element.style.width = '32px';
        element.style.height = '32px';
        element.style.top = '0px';
        element.style.cssFloat = 'right';
        // Where to get the icon?
        element.innerText = 'close';
        element.addEventListener('click', () => this.close());

        return element;
    }

    private _createContents(id?: string): HTMLElement {
        const element = document.createElement('div');
        element.style.display = 'block';
        element.style.width = '100%';
        element.style.height = '100%';

        if (id) {
            element.id = id;
        }

        return element;
    }
}
