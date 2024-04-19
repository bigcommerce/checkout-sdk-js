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

    afterEach(() => {
        Object.defineProperty(window.document, 'cookie', {
            writable: true,
            value: '',
        });
    });

    it('retrieve an existing value by name', () => {
        expect(CookieStorage.get('first_user')).toContain('John');
        expect(CookieStorage.get('description')).toBe('any small description =');
    });

    it('returns null if there is no value by name', () => {
        expect(CookieStorage.get('some')).toBeNull();
    });

    it('retrieve the existing value by name after setting', () => {
        const date = new Date('09 Jan 2024 14:04:48 GMT');

        CookieStorage.set('agent', 'Smith', {
            expires: date,
            secure: false,
            domain: 'domain',
            path: 'path',
        });

        expect(window.document.cookie).toContain(
            'agent=Smith; expires=Tue, 09 Jan 2024 14:04:48 GMT; path=path; domain=domain',
        );
    });

    it('retrieve the existing value by name after setting without additional options', () => {
        CookieStorage.set('agent', 'Smith');

        expect(window.document.cookie).toContain('agent=Smith');
    });

    it('remove value by name', () => {
        jest.spyOn(CookieStorage, 'set').mockImplementation();

        CookieStorage.remove('last_user');

        expect(CookieStorage.set).toHaveBeenCalledWith('last_user', '', { expires: new Date(0) });
    });
});
