import { CheckoutSelectors } from '../checkout';
import { DataStoreProjection } from '../common/data-store';

import { ExtensionEventType } from './extension-client';
import { ExtensionEventBroadcaster } from './extension-event-broadcaster';
import { ExtensionMessenger } from './extension-messenger';
import { subscribeConsignmentsChange } from './subscribers';

export function createExtensionEventBroadcaster(
    store: DataStoreProjection<CheckoutSelectors>,
    messenger: ExtensionMessenger,
): ExtensionEventBroadcaster {
    const subscribers = {
        [ExtensionEventType.ConsignmentsChanged]: subscribeConsignmentsChange,
    };

    return new ExtensionEventBroadcaster(store, messenger, subscribers);
}
