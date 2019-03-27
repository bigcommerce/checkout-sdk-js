export interface OverlayOptions {
    background?: string;
    id?: string;
    transitionDuration?: number;
}

export interface OverlayShowOptions {
    onClick?(event: MouseEvent): void;
}

export default class Overlay {
    private _element: HTMLElement;
    private _unregisterClick?: () => void;

    constructor(options?: OverlayOptions) {
        this._element = this._createElement(options);
    }

    show(options?: OverlayShowOptions): void {
        if (this._element.parentElement) {
            return;
        }

        this._registerClick(options);

        document.body.appendChild(this._element);

        // Fade In
        setTimeout(() => this._element.style.opacity = '1');
    }

    remove(): void {
        if (!this._element.parentElement) {
            return;
        }

        if (this._unregisterClick) {
            this._unregisterClick();
        }

        this._removeAfterTransition();

        setTimeout(() => this._element.style.opacity = '0');
    }

    private _createElement(options?: OverlayOptions): HTMLElement {
        const element = document.createElement('div');
        const {
            background = 'rgba(0, 0, 0, 0.8)',
            id = null,
            transitionDuration = 400,
        } = options || {};

        element.style.background = background;
        element.style.display = 'block';
        element.style.height = '100%';
        element.style.left = '0px';
        element.style.opacity = '0';
        element.style.position = 'fixed';
        element.style.top = '0px';
        element.style.transition = `opacity ${transitionDuration}ms ease-out`;
        element.style.width = '100%';
        element.style.zIndex = '2147483647';

        if (id) {
            element.id = id;
        }

        return element;
    }

    private _registerClick(options?: OverlayShowOptions): void {
        if (this._unregisterClick) {
            this._unregisterClick();
        }

        if (options && options.onClick) {
            const { onClick } = options;

            this._element.addEventListener('click', onClick);

            this._unregisterClick = () => {
                this._element.removeEventListener('click', onClick);
                this._unregisterClick = undefined;
            };
        }
    }

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
