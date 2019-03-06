import BrowserStorage from './browser-storage';

describe('BrowserStorage', () => {
    afterEach(() => {
        localStorage.clear();
    });

    it('stores item with key that is prefixed with namespace', () => {
        const storage = new BrowserStorage('foobar');

        storage.setItem('message', 'Hello world');

        expect(localStorage.getItem('foobar.message'))
            .toEqual(JSON.stringify('Hello world'));
    });

    it('stores item as JSON string and restores it back to its original type when it is retrieved', () => {
        const storage = new BrowserStorage('foobar');

        storage.setItem('flag', true);
        storage.setItem('numbers', [1, 2, 3]);

        expect(storage.getItem('flag'))
            .toEqual(true);

        expect(storage.getItem('numbers'))
            .toEqual([1, 2, 3]);
    });

    it('retrieves item and removes it from storage', () => {
        const storage = new BrowserStorage('foobar');

        storage.setItem('message', 'Hello world');

        expect(storage.getItemOnce('message'))
            .toEqual('Hello world');

        expect(storage.getItem('message'))
            .toEqual(null);
    });

    it('removes item from storage', () => {
        const storage = new BrowserStorage('foobar');

        storage.setItem('message', 'Hello world');
        storage.removeItem('message');

        expect(storage.getItem('message'))
            .toEqual(null);
    });

    it('returns null for unknown key', () => {
        const storage = new BrowserStorage('foobar');

        expect(storage.getItem('abc'))
            .toEqual(null);
    });
});
