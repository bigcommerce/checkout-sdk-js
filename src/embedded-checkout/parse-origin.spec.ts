import { InvalidArgumentError } from '../common/error/errors';

import parseOrigin from './parse-origin';

describe('parseOrigin()', () => {
    it('returns origin of URL', () => {
        expect(parseOrigin('https://foobar.com/hello/world'))
            .toEqual('https://foobar.com');

        expect(parseOrigin('http://foobar.com/hello/world'))
            .toEqual('http://foobar.com');

        expect(parseOrigin('//foobar.com/hello/world'))
            .toEqual('http://foobar.com');
    });

    it('throws error if URL is not absolute', () => {
        expect(() => parseOrigin('/hello/world'))
            .toThrow(InvalidArgumentError);
    });
});
