import parseUrl from './parse-url';
import Url from './url';

export default function appendWww(url: Url): Url {
    return parseUrl(
        url.hostname.startsWith('www')
            ? url.href
            : url.href.replace(url.hostname, `www.${url.hostname}`),
    );
}
