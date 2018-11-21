import { InvalidArgumentError } from '../error/errors';

import Url from './url';

export default function parseUrl(url: string): Url {
    if (!/^(https?:)?\/\//.test(url)) {
        throw new InvalidArgumentError('The provided URL must be absolute.');
    }

    // new URL() is not supported in IE11, use anchor tag instead
    const anchor = document.createElement('a');

    anchor.href = url;

    return {
        hash: anchor.hash,
        hostname: anchor.hostname,
        href: anchor.href,
        origin: anchor.origin,
        pathname: anchor.pathname,
        port: anchor.port,
        protocol: anchor.protocol,
        search: anchor.search,
    };
}
