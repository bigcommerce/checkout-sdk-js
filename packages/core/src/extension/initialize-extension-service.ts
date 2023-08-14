import {
    IframeEventListener,
    IframeEventPoster,
    setupContentWindowForIframeResizer,
} from '../common/iframe';

import { ExtensionCommand, ExtensionCommandType } from './extension-commands';
import { ExtensionEventMap } from './extension-events';
import { ExtensionInternalCommand } from './extension-internal-commands';
import ExtensionService from './extension-service';

export interface InitializeExtensionServiceOptions {
    extensionId: string;
    parentOrigin: string;
}

export default function initializeExtensionService(options: InitializeExtensionServiceOptions) {
    const { extensionId, parentOrigin } = options;

    setupContentWindowForIframeResizer();

    const extension = new ExtensionService(
        new IframeEventListener<ExtensionEventMap>(parentOrigin),
        new IframeEventPoster<ExtensionCommand>(parentOrigin),
        new IframeEventPoster<ExtensionInternalCommand>(parentOrigin),
    );

    extension.initialize(extensionId);
    extension.post({ type: ExtensionCommandType.FrameLoaded });

    return extension;
}
