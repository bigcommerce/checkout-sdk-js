import { ReadableCheckoutStore } from '../checkout';

import { ExtensionEventType } from './extension-client';
import { ExtensionEventBroadcaster } from './extension-event-broadcaster';
import { ExtensionMessenger } from './extension-messenger';
import { subscribeShippingCountryChange } from './subscribers';

export function createExtensionEventBroadcaster(
    store: ReadableCheckoutStore,
): ExtensionEventBroadcaster {
    const messenger = new ExtensionMessenger(store);
    const subscribers = {
        [ExtensionEventType.ShippingCountryChanged]: subscribeShippingCountryChange,
    };

    return new ExtensionEventBroadcaster(store, messenger, subscribers);
}
