import { IframeEventPoster } from '../common/iframe';

import { ExtensionNotFoundError } from './errors';
import { Extension } from './extension';

export function createExtensionEventPoster<T>(extension: Extension): IframeEventPoster<T> {
    const iframe = document
        .querySelector(`[data-extension-id="${extension.id}"]`)
        ?.querySelector('iframe');

    if (!iframe?.contentWindow) {
        throw new ExtensionNotFoundError(
            `Unable to post due to no extension rendered for ID: ${extension.id}.`,
        );
    }

    return new IframeEventPoster<T>(extension.url, iframe.contentWindow);
}
