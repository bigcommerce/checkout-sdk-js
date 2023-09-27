import {
    IframeEventListener,
    IframeEventPoster,
    setupContentWindowForIframeResizer,
} from '../common/iframe';

import { ExtensionCommand, ExtensionCommandContext } from './extension-commands';
import { ExtensionEventMap } from './extension-events';
import { ExtensionInternalCommand } from './extension-internal-commands';
import ExtensionService from './extension-service';
import { iframeResizerSetup } from './iframe-resizer-setup';

export interface InitializeExtensionServiceOptions {
    extensionId: string;
    parentOrigin: string;
    taggedElementId?: string;
    fixedHeight?: number;
}

export default async function initializeExtensionService(
    options: InitializeExtensionServiceOptions,
): Promise<ExtensionService> {
    const { extensionId, parentOrigin, taggedElementId, fixedHeight } = options;

    setupContentWindowForIframeResizer();

    const extension = new ExtensionService(
        new IframeEventListener<ExtensionEventMap>(parentOrigin),
        new IframeEventPoster<ExtensionCommand, ExtensionCommandContext>(parentOrigin),
        new IframeEventPoster<ExtensionInternalCommand>(parentOrigin),
    );

    await extension.initialize(extensionId);

    iframeResizerSetup(taggedElementId, fixedHeight);

    return extension;
}
