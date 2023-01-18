import Overlay from './overlay';

describe('Overlay', () => {
    let overlay: Overlay;

    describe('only overlay element', () => {
        beforeEach(() => {
            overlay = new Overlay({
                id: 'overlay',
                transitionDuration: 400,
            });
        });

        afterEach(() => {
            const element = document.getElementById('overlay');

            if (element) {
                element.parentElement!.removeChild(element);
            }
        });

        it('shows element', () => {
            overlay.show();

            const element = document.getElementById('overlay');

            expect(element).not.toBeNull();
        });

        it('shows styles', () => {
            overlay.show();

            const styles = document.getElementById('overlay--styles');

            expect(styles).not.toBeNull();
        });

        it('triggers click handler if it is provided', () => {
            const onClick = jest.fn();

            overlay.show({ onClick });

            const element = document.getElementById('overlay');

            element!.dispatchEvent(new MouseEvent('click'));

            expect(onClick).toHaveBeenCalled();
        });

        it('fades element into view', async () => {
            overlay.show();

            const element = document.getElementById('overlay');

            await new Promise((resolve) => {
                setTimeout(resolve, 400);
            });

            expect(element!.style.opacity).toBe('1');
        });

        it('fades element out of view', async () => {
            overlay.show();

            const element = document.getElementById('overlay');

            overlay.remove();

            await new Promise((resolve) => {
                setTimeout(resolve, 400);
            });

            expect(element!.style.opacity).toBe('0');
        });

        it('removes click handler when element is removed', () => {
            const onClick = jest.fn();

            overlay.show({ onClick });

            const element = document.getElementById('overlay');

            overlay.remove();

            element!.dispatchEvent(new MouseEvent('click'));

            expect(onClick).not.toHaveBeenCalled();
        });
    });

    describe('with close element', () => {
        beforeEach(() => {
            overlay = new Overlay({ hasCloseButton: true });
        });

        afterEach(() => {
            const element = document.querySelector('.checkoutOverlay--layout');

            if (element) {
                element.parentElement!.removeChild(element);
            }
        });

        it('shows layout element', () => {
            overlay.show();

            const element = document.querySelector('.checkoutOverlay--layout');

            expect(element).not.toBeNull();
        });

        it('shows close element', () => {
            overlay.show();

            const element = document.querySelector('.checkoutOverlay--close');

            expect(element).not.toBeNull();
        });

        it('triggers click handler if it is provided', () => {
            const onClick = jest.fn();

            overlay.show({ onClick });

            const element = document.getElementById('checkoutOverlay');

            element!.dispatchEvent(new MouseEvent('click'));

            expect(onClick).toHaveBeenCalled();
        });

        it('triggers close click handler if it is provided', () => {
            const onClickClose = jest.fn();

            overlay.show({ onClickClose });

            const closeElement = document.querySelector('.checkoutOverlay--close');

            closeElement!.dispatchEvent(new MouseEvent('click'));

            expect(onClickClose).toHaveBeenCalled();
        });

        it('removes click handler when element is removed', () => {
            const onClickClose = jest.fn();

            overlay.show({ onClickClose });

            const closeElement = document.querySelector('.checkoutOverlay--close');

            overlay.remove();

            closeElement!.dispatchEvent(new MouseEvent('click'));

            expect(onClickClose).not.toHaveBeenCalled();
        });
    });

    describe('with modal and inner element', () => {
        beforeEach(() => {
            const innerHtml = document.createElement('div');

            innerHtml.id = 'innerElement';
            overlay = new Overlay({ innerHtml });
        });

        afterEach(() => {
            const element = document.getElementById('checkoutOverlay');

            if (element) {
                element.parentElement!.removeChild(element);
            }
        });

        it('shows overlayText element', () => {
            overlay.show();

            const modal = document.querySelector('.checkoutOverlay--overlayText');

            expect(modal).not.toBeNull();
        });

        it('shows inner element', () => {
            overlay.show();

            const innerElement = document.getElementById('innerElement');

            expect(innerElement).not.toBeNull();
        });

        it('shows Document Fragment of inner elements', () => {
            const innerElement = document.createElement('div');

            innerElement.id = 'innerElement';

            const innerElement2 = document.createElement('div');

            innerElement2.id = 'innerElement2';

            const fragment = document.createDocumentFragment();

            fragment.appendChild(innerElement);
            fragment.appendChild(innerElement2);

            overlay = new Overlay({ innerHtml: fragment });

            overlay.show();

            const element = document.getElementById('innerElement');
            const element2 = document.getElementById('innerElement2');

            expect(element).not.toBeNull();
            expect(element2).not.toBeNull();
        });
    });

    describe('Multiple overlays', () => {
        beforeEach(() => {
            overlay = new Overlay({
                id: 'overlay',
            });
        });

        afterEach(() => {
            const element = document.getElementById('overlay');

            if (element) {
                element.parentElement!.removeChild(element);
            }
        });

        it('show multiple overlays', () => {
            overlay.show();
            overlay.show();

            const elements = document.querySelectorAll('#overlay');

            expect(elements).toHaveLength(1);
        });
    });
});
