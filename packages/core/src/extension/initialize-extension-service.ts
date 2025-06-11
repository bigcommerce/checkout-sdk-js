import {
    IframeEventListener,
    IframeEventPoster,
    setupContentWindowForIframeResizer,
} from '../common/iframe';
import { WorkerEventListener, WorkerEventPoster } from '../common/worker';
import { createExtensionWebWorker } from './create-extension-web-worker';

import { ExtensionCommand } from './extension-commands';
import { ExtensionEventMap } from './extension-events';
import { ExtensionInternalCommand } from './extension-internal-commands';
import { ExtensionCommandOrQueryContext, ExtensionMessageMap } from './extension-message';
import ExtensionService from './extension-service';
import { iframeResizerSetup } from './iframe-resizer-setup';
import WorkerExtensionService from './worker-extension-service';

export interface InitializeExtensionServiceOptions {
    extensionId?: string;
    parentOrigin?: string;
    taggedElementId?: string;
    fixedHeight?: number;
}

export default async function initializeExtensionService(
    options: InitializeExtensionServiceOptions,
): Promise<ExtensionService | WorkerExtensionService> {
    const { extensionId, parentOrigin, taggedElementId, fixedHeight } = options;

    if (extensionId && parentOrigin && taggedElementId) {
        setupContentWindowForIframeResizer();

        const extension = new ExtensionService(
            new IframeEventListener<ExtensionMessageMap>(parentOrigin),
            new IframeEventListener<ExtensionEventMap>(parentOrigin),
            new IframeEventPoster<ExtensionCommand, ExtensionCommandOrQueryContext>(parentOrigin),
            new IframeEventPoster<ExtensionInternalCommand>(parentOrigin),
        );

        await extension.initialize(extensionId);

        iframeResizerSetup(taggedElementId, fixedHeight);

        return extension;
    }

    const tempExtensionUrl = 'https://store-2wfcdbnueu.store.bcdev/content/translate-worker.js'; // Placeholder URL for the worker script
    const worker = createExtensionWebWorker(tempExtensionUrl);
    const extension = new WorkerExtensionService(
        new WorkerEventListener<ExtensionMessageMap>(worker),
        new WorkerEventListener<ExtensionEventMap>(worker),
        new WorkerEventPoster<ExtensionCommand, ExtensionCommandOrQueryContext>(worker),
        // new WorkerEventPoster<ExtensionInternalCommand>(worker),
    )

    return extension;
}
