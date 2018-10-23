import { InvalidArgumentError } from '../common/error/errors';

export default function parseOrigin(url: string): string {
    if (!/^(https?:)?\/\//.test(url)) {
        throw new InvalidArgumentError('The provided URL must be absolute.');
    }

    // new URL() is not supported in IE11, use anchor tag instead
    const anchor = document.createElement('a');

    anchor.href = url;

    return `${anchor.protocol}//${anchor.hostname}` + (anchor.port ? `:${anchor.port}` : '');
}
