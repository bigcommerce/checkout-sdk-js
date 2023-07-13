import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import {
    ExtensionListenEventMap,
    ExtensionPostEvent,
    ExtensionPostEventType,
    InitializeExtensionServiceOptions,
} from './extension-client';
import ExtensionService from './extension-service';

export default function initializeExtensionService(options: InitializeExtensionServiceOptions) {
    const { extensionId, parentOrigin } = options;

    const extension = new ExtensionService(
        new IframeEventListener<ExtensionListenEventMap>(parentOrigin),
        new IframeEventPoster<ExtensionPostEvent>(parentOrigin),
    );

    extension.initialize(extensionId);
    extension.post({ type: ExtensionPostEventType.FRAME_LOADED, payload: { extensionId } });

    return extension;
}
