import Overlay from './overlay';

// tslint:disable:no-non-null-assertion
describe('Overlay', () => {
    let overlay: Overlay;

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

    it('shows element on top of everything else', () => {
        overlay.show();

        const element = document.getElementById('overlay');

        expect(element).toBeTruthy();
        expect(element!.style.background).toEqual('rgba(0, 0, 0, 0.8)');
        expect(element!.style.height).toEqual('100%');
        expect(element!.style.left).toEqual('0px');
        expect(element!.style.position).toEqual('fixed');
        expect(element!.style.top).toEqual('0px');
        expect(element!.style.width).toEqual('100%');
        expect(element!.style.zIndex).toEqual('2147483647');
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

        expect(element!.style.opacity).toEqual('0');

        await new Promise(resolve => {
            setTimeout(resolve, 400);
        });

        expect(element!.style.opacity).toEqual('1');
    });

    it('fades element out of view', async () => {
        overlay.show();

        const element = document.getElementById('overlay');

        overlay.remove();

        await new Promise(resolve => {
            setTimeout(resolve, 400);
        });

        expect(element!.style.opacity).toEqual('0');
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
// tslint:enable:no-non-null-assertion
