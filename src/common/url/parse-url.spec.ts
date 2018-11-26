import { InvalidArgumentError } from '../error/errors';

import parseUrl from './parse-url';

describe('parseUrl()', () => {
    it('parses URL string', () => {
        expect(parseUrl('https://foobar.com:8080/hello/world?foo=1&bar=2#heading'))
            .toEqual({
                hash: '#heading',
                hostname: 'foobar.com',
                href: 'https://foobar.com:8080/hello/world?foo=1&bar=2#heading',
                origin: 'https://foobar.com:8080',
                pathname: '/hello/world',
                port: '8080',
                protocol: 'https:',
                search: '?foo=1&bar=2',
            });
    });

    it('throws error if URL is not absolute', () => {
        expect(() => parseUrl('/hello/world'))
            .toThrow(InvalidArgumentError);
    });
});
