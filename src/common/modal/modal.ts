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
    headerClassName?: string;
    // width?: string;
}

export interface ModalShowOptions {
    onClick?(event: MouseEvent): void;
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
        // if (this._element.parentElement) {
        //     return;
        // }
        const { openCallback, closeCallback } = options || {};

        this._closeCallback = closeCallback || noop ;

        if (openCallback) {
            openCallback();
        }

        this.overlay.show();

        setTimeout(() => this._element.style.opacity = '1');
        setTimeout(() => this._element.style.display = 'block');
    }

    close(): void {
        if (!this._element.parentElement) {
            return;
        }

        if (this._closeCallback) {
            this._closeCallback();
        }

        this.overlay.remove();

        this._removeAfterTransition();

        setTimeout(() => this._element.style.opacity = '0');
    }

    showCloseButton(): void {
        this._closeButton.style.display = 'block';
    }

    hideCloseButton(): void {
        this._closeButton.style.display = 'none';
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

        this._createCloseButton(element);
        this._createContents(element, contentsId);

        document.body.appendChild(element);

        return element;
    }

    private _createCloseButton(parent: HTMLElement): void {
        const element = document.createElement('button');
        element.style.width = '32px';
        element.style.height = '32px';
        element.style.top = '0px';
        element.style.cssFloat = 'right';
        // Where to get the icon?
        element.innerText = 'close';
        element.addEventListener('click', () => this.close());

        this._closeButton = element;
        parent.appendChild(this._closeButton);
    }

    private _createContents(parent: HTMLElement, id?: string): void {
        const element = document.createElement('div');
        element.style.display = 'block';
        element.style.width = '100%';
        element.style.height = '100%';
        element.style.top = '0px';

        if (id) {
            element.id = id;
        }
        parent.appendChild(element);
    }

    // private _registerClick(options?: ModalShowOptions): void {
    //     if (this._unregisterClick) {
    //         this._unregisterClick();
    //     }

    //     if (options && options.onClick) {
    //         const { onClick } = options;

    //         this._element.addEventListener('click', onClick);

    //         this._unregisterClick = () => {
    //             this._element.removeEventListener('click', onClick);
    //             this._unregisterClick = undefined;
    //         };
    //     }
    // }

    private _removeAfterTransition(): void {
        const handeTransition: (event: Event) => void = event => {
            // NOTE: `event` is not correctly typed in this version of TS
            if ((event as TransitionEvent).propertyName !== 'opacity') {
                return;
            }

            if (this._element.parentElement) {
                this._element.parentElement.removeChild(this._element);
            }

            this._element.removeEventListener('transitionend', handeTransition);
        };

        this._element.addEventListener('transitionend', handeTransition);
    }
}
