import { ReadableCheckoutStore } from '../../checkout';
import { ExtensionEventBroadcaster } from '../extension-event-broadcaster';

export type ExtensionChangeSubscriber = (
    store: ReadableCheckoutStore,
    broadcaster: ExtensionEventBroadcaster,
) => ExtensionChangeUnsubscriber;

export type ExtensionChangeUnsubscriber = () => void;
