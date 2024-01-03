import CookieStorage from './cookie-storage';

describe('CookieStorage', () => {
    beforeEach(() => {
        Object.defineProperty(window.document, 'cookie', {
            writable: true,
            value: `first_user=John;last_user=Ann;description=${encodeURIComponent(
                'any small description =',
            )}`,
        });
    });

    it('retrieve an existing value by name', () => {
        expect(CookieStorage.get('description')).toBe('any small description =');
    });

    it('returns null if there is no value by name', () => {
        expect(CookieStorage.get('some')).toBeNull();
    });

    it('retrieve the existing value by name after setting', () => {
        CookieStorage.set('agent', 'Smith');

        expect(CookieStorage.get('agent')).toBe('Smith');
    });

    it('remove value by name', () => {
        jest.spyOn(CookieStorage, 'set').mockImplementation();

        CookieStorage.remove('last_user');

        expect(CookieStorage.set).toHaveBeenCalledWith('last_user', '', { expires: new Date(0) });
    });
});
