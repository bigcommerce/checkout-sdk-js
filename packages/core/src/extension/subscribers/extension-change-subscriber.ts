import { CheckoutSelectors } from '../../checkout';
import { DataStoreProjection } from '../../common/data-store';
import { ExtensionEventBroadcaster } from '../extension-event-broadcaster';

export type ExtensionChangeSubscriber = (
    store: DataStoreProjection<CheckoutSelectors>,
    broadcaster: ExtensionEventBroadcaster,
) => ExtensionChangeUnsubscriber;

export type ExtensionChangeUnsubscriber = () => void;
