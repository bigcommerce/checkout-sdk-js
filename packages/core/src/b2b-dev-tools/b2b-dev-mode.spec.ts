// TODO: CHECKOUT-9979 remove this file before delivery
import { isB2bDevModeEnabled, resolveB2bAppClientId, resolveB2bBaseUrl } from './b2b-dev-mode';

describe('b2b-dev-mode', () => {
    const originalLocation = window.location;

    function setSearch(search: string) {
        delete (window as { location?: Location }).location;
        (window as { location: Pick<Location, 'search'> }).location = { search };
    }

    afterEach(() => {
        delete (window as { location?: Location }).location;
        (window as { location: Location }).location = originalLocation;
    });

    describe('isB2bDevModeEnabled', () => {
        it('returns true when enableB2bDevMode is present (no value)', () => {
            setSearch('?enableB2bDevMode');

            expect(isB2bDevModeEnabled()).toBe(true);
        });

        it('returns true when enableB2bDevMode=true', () => {
            setSearch('?enableB2bDevMode=true');

            expect(isB2bDevModeEnabled()).toBe(true);
        });

        it('returns true when enableB2bDevMode is one of many params', () => {
            setSearch('?foo=bar&enableB2bDevMode&baz=qux');

            expect(isB2bDevModeEnabled()).toBe(true);
        });

        it('returns false when param is absent', () => {
            setSearch('?foo=bar');

            expect(isB2bDevModeEnabled()).toBe(false);
        });

        it('returns false when search is empty', () => {
            setSearch('');

            expect(isB2bDevModeEnabled()).toBe(false);
        });
    });

    describe('resolveB2bAppClientId', () => {
        it('returns dev id when dev mode enabled', () => {
            setSearch('?enableB2bDevMode');

            expect(resolveB2bAppClientId('prod-id')).toBe('dl7c39mdpul6hyc489yk0vzxl6jesyx');
        });

        it('returns fallback when dev mode disabled', () => {
            setSearch('');

            expect(resolveB2bAppClientId('prod-id')).toBe('prod-id');
        });

        it('returns empty fallback when dev mode disabled and fallback is empty', () => {
            setSearch('');

            expect(resolveB2bAppClientId('')).toBe('');
        });
    });

    describe('resolveB2bBaseUrl', () => {
        it('returns dev url when dev mode enabled', () => {
            setSearch('?enableB2bDevMode');

            expect(resolveB2bBaseUrl('https://prod.example.com')).toBe(
                'https://api-b2b.bigcommerce.com',
            );
        });

        it('returns fallback when dev mode disabled', () => {
            setSearch('');

            expect(resolveB2bBaseUrl('https://prod.example.com')).toBe('https://prod.example.com');
        });
    });
});
