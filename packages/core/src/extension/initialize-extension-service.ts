import {
    IframeEventListener,
    IframeEventPoster,
    setupContentWindowForIframeResizer,
} from '../common/iframe';

import { ExtensionCommand, ExtensionCommandContext } from './extension-commands';
import { ExtensionEventMap } from './extension-events';
import { ExtensionInternalCommand } from './extension-internal-commands';
import ExtensionService from './extension-service';

import { enableAutoResizing } from './iframe-resizer-methods';

export interface InitializeExtensionServiceOptions {
    extensionId: string;
    parentOrigin: string;
    taggedElementId?: string;
}

export default async function initializeExtensionService(
    options: InitializeExtensionServiceOptions,
): Promise<ExtensionService> {
    const { extensionId, parentOrigin, taggedElementId } = options;

    setupContentWindowForIframeResizer();

    const extension = new ExtensionService(
        new IframeEventListener<ExtensionEventMap>(parentOrigin),
        new IframeEventPoster<ExtensionCommand, ExtensionCommandContext>(parentOrigin),
        new IframeEventPoster<ExtensionInternalCommand>(parentOrigin),
    );

    extension.initialize(extensionId);

    await enableAutoResizing(taggedElementId);

    return extension;
}
