import {
    LoadingIndicatorContainerStyles,
    LoadingIndicatorStyles,
} from './loading-indicator-styles';

const DEFAULT_STYLES: LoadingIndicatorStyles = {
    size: 70,
    color: '#d9d9d9',
    backgroundColor: '#ffffff',
};

const ROTATION_ANIMATION = 'embedded-checkout-loading-indicator-rotation';

interface LoadingIndicatorOptions {
    styles?: LoadingIndicatorStyles;
    containerStyles?: LoadingIndicatorContainerStyles;
}

export default class LoadingIndicator {
    private container: HTMLElement;
    private indicator: HTMLElement;
    private styles: LoadingIndicatorStyles;
    private containerStyles: LoadingIndicatorContainerStyles;

    constructor(options?: LoadingIndicatorOptions) {
        this.styles = { ...DEFAULT_STYLES, ...(options && options.styles) };
        this.containerStyles = { ...(options && options.containerStyles) };

        this.defineAnimation();

        this.container = this.buildContainer();
        this.indicator = this.buildIndicator();

        this.container.appendChild(this.indicator);
    }

    show(parentId?: string): void {
        if (parentId) {
            const parent = document.getElementById(parentId);

            if (!parent) {
                throw new Error(
                    'Unable to attach the loading indicator because the parent ID is not valid.',
                );
            }

            parent.appendChild(this.container);
        }

        this.container.style.visibility = 'visible';
        this.container.style.opacity = '1';
    }

    hide(): void {
        const handleTransitionEnd = () => {
            this.container.style.visibility = 'hidden';

            this.container.removeEventListener('transitionend', handleTransitionEnd);
        };

        this.container.addEventListener('transitionend', handleTransitionEnd);

        this.container.style.opacity = '0';
    }

    private buildContainer(): HTMLElement {
        const container = document.createElement('div');

        container.style.display = 'block';
        container.style.bottom = '0';
        container.style.left = '0';
        container.style.height = '100%';
        container.style.width = '100%';
        container.style.position = 'absolute';
        container.style.right = '0';
        container.style.top = '0';
        container.style.transition = 'all 250ms ease-out';
        container.style.opacity = '0';

        this.setStyleAttribute(container, this.containerStyles);

        return container;
    }

    private buildIndicator(): HTMLElement {
        const indicator = document.createElement('div');

        indicator.style.display = 'block';
        indicator.style.width = `${this.styles.size}px`;
        indicator.style.height = `${this.styles.size}px`;
        indicator.style.borderRadius = `${this.styles.size}px`;
        indicator.style.border = 'solid 1px';
        indicator.style.borderColor = `${this.styles.backgroundColor} ${this.styles.backgroundColor} ${this.styles.color} ${this.styles.color}`;
        indicator.style.margin = '0 auto';
        indicator.style.position = 'absolute';
        indicator.style.left = '0';
        indicator.style.right = '0';
        indicator.style.top = '50%';
        indicator.style.transform = 'translateY(-50%) rotate(0deg)';
        indicator.style.transformStyle = 'preserve-3d';
        indicator.style.animation = `${ROTATION_ANIMATION} 500ms infinite cubic-bezier(0.69, 0.31, 0.56, 0.83)`;

        return indicator;
    }

    private setStyleAttribute(element: HTMLElement, attrs: { [key: string]: string }): void {
        Object.keys(attrs).forEach((k) => {
            element.style.setProperty(k, attrs[k]);
        });
    }

    private defineAnimation(): void {
        // In order to define CSS animation, we need to insert a stylesheet into the host frame.
        // We only have to do it once.
        if (document.getElementById(ROTATION_ANIMATION)) {
            return;
        }

        const style = document.createElement('style');

        style.id = ROTATION_ANIMATION;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        document.head?.appendChild(style);

        if (style.sheet instanceof CSSStyleSheet) {
            // We need to provide the 2nd parameter for IE11, even though it is
            // 0 by default for all other browsers.
            style.sheet.insertRule(
                `
                @keyframes ${ROTATION_ANIMATION} {
                    0% { transform: translateY(-50%) rotate(0deg); }
                    100% { transform: translateY(-50%) rotate(360deg); }
                }
            `,
                0,
            );
        }
    }
}
