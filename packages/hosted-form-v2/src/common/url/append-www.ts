import parseUrl from './parse-url';
import Url from './url';

export default function appendWww(url: Url): Url {
    return parseUrl(
        url.hostname.indexOf('www') === 0
            ? url.href
            : url.href.replace(url.hostname, `www.${url.hostname}`),
    );
}
