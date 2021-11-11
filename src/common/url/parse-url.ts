// eslint-disable-next-line import/no-internal-modules
import URL from 'core-js-pure/web/url';

import { InvalidArgumentError } from '../error/errors';

export default function parseUrl(url: string): globalThis.URL {
    if (!/^(https?:)?\/\//.test(url)) {
        throw new InvalidArgumentError('The provided URL must be absolute.');
    }

    return new URL(url);
}
