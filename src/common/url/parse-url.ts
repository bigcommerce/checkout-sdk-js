import { InvalidArgumentError } from '../error/errors';

import Url from './url';

export default function parseUrl(url: string): Url {
    if (!/^(https?:)?\/\//.test(url)) {
        throw new InvalidArgumentError('The provided URL must be absolute.');
    }

    // new URL() is not supported in IE11, use anchor tag instead
    const anchor = document.createElement('a');

    anchor.href = url;

    // IE11 returns 80 or 443 for the port number depending on the URL scheme,
    // even if the port number is not specified in the URL.
    const port = anchor.port && url.indexOf(`${anchor.hostname}:${anchor.port}`) !== -1 ?
        anchor.port :
        '';

    return {
        hash: anchor.hash,
        hostname: anchor.hostname,
        href: anchor.href,
        origin: `${anchor.protocol}//${anchor.hostname}${port ? ':' + port : ''}`,
        pathname: anchor.pathname,
        port,
        protocol: anchor.protocol,
        search: anchor.search,
    };
}
