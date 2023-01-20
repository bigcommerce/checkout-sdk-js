import LoadingIndicator from './loading-indicator';

describe('LoadingIndicator', () => {
    let indicator: LoadingIndicator;
    let parentId: string;
    let parent: HTMLElement;

    beforeEach(() => {
        parentId = 'container';
        indicator = new LoadingIndicator();

        parent = document.createElement('div');
        parent.id = parentId;

        document.body.appendChild(parent);
    });

    afterEach(() => {
        document.body.removeChild(parent);
    });

    it('inserts loading indicator element into container', () => {
        indicator.show(parentId);

        expect(parent.firstChild).toMatchSnapshot();
    });

    it('renders loading indicator with provided styles prop', () => {
        indicator = new LoadingIndicator({
            styles: {
                size: 10,
            },
        });

        indicator.show(parentId);

        const child = parent.firstChild as HTMLElement;
        const loadingIndicator = child.firstChild as HTMLElement;

        expect(loadingIndicator.style.width).toBe('10px');
        expect(loadingIndicator.style.height).toBe('10px');
    });

    it('shows loading indicator', () => {
        indicator.show(parentId);

        const child = parent.firstChild as HTMLElement;

        expect(child.style.visibility).toBe('visible');
        expect(child.style.opacity).toBe('1');
    });

    it('throws error is parent element does not exist', () => {
        expect(() => indicator.show('invalid_container')).toThrow();
    });

    it('hides loading indicator', () => {
        indicator.show(parentId);
        indicator.hide();

        const child = parent.firstChild as HTMLElement;

        expect(child.style.opacity).toBe('0');
    });

    it('completely hides loading indicator once transition is complete', () => {
        indicator.show(parentId);
        indicator.hide();

        const child = parent.firstChild as HTMLElement;
        const event = new Event('transitionend');

        child.dispatchEvent(event);

        expect(child.style.visibility).toBe('hidden');
    });

    it('does not throw error if it is already hidden', () => {
        expect(() => indicator.hide()).not.toThrow();
    });
});
