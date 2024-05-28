import appendWww from './append-www';

describe('appendWww', () => {
    it('appends www to URL', () => {
        const url = {
            hash: '',
            hostname: 'foobar.com',
            href: 'https://foobar.com:8080/bar?foo=foo',
            origin: 'https://foobar.com:8080',
            pathname: '/bar',
            port: '8080',
            protocol: 'https:',
            search: '?foo=foo',
        };

        expect(appendWww(url)).toEqual({
            ...url,
            origin: 'https://www.foobar.com:8080',
            hostname: 'www.foobar.com',
            href: 'https://www.foobar.com:8080/bar?foo=foo',
        });
    });

    it('does not www to URL if already has www', () => {
        const url = {
            hash: '',
            hostname: 'www.foobar.com',
            href: 'https://www.foobar.com:8080/bar?foo=foo',
            origin: 'https://www.foobar.com:8080',
            pathname: '/bar',
            port: '8080',
            protocol: 'https:',
            search: '?foo=foo',
        };

        expect(appendWww(url)).toEqual(url);
    });
});
