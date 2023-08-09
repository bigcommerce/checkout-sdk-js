import {
    IframeEventListener,
    IframeEventPoster,
    setupContentWindowForIframeResizer,
} from '../common/iframe';

import {
    ExtensionCommand,
    ExtensionCommandType,
    ExtensionEventMap,
    InitializeExtensionServiceOptions,
} from './extension-client';
import { ExtensionInternalCommand } from './extension-internal-commands';
import ExtensionService from './extension-service';

export default function initializeExtensionService(options: InitializeExtensionServiceOptions) {
    const { extensionId, parentOrigin } = options;

    setupContentWindowForIframeResizer();

    const extension = new ExtensionService(
        new IframeEventListener<ExtensionEventMap>(parentOrigin),
        new IframeEventPoster<ExtensionCommand>(parentOrigin),
        new IframeEventPoster<ExtensionInternalCommand>(parentOrigin),
    );

    extension.initialize(extensionId);
    extension.post({ type: ExtensionCommandType.FRAME_LOADED, payload: { extensionId } });

    return extension;
}
