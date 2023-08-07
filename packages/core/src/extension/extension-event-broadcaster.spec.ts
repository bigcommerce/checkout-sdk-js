import EventEmitter from 'events';

import { CheckoutSelectors } from '../checkout';
import { DataStoreProjection } from '../common/data-store';
import { getConsignments } from '../shipping/consignments.mock';

import { ExtensionEventType } from './extension-client';
import { ExtensionEventBroadcaster } from './extension-event-broadcaster';
import { ExtensionInternalCommandType } from './extension-internal-commands';
import { ExtensionMessenger } from './extension-messenger';
import { getExtensions } from './extension.mock';
import { ExtensionChangeSubscriber } from './subscribers';

describe('ExtensionEventBroadcaster', () => {
    let store: Pick<DataStoreProjection<CheckoutSelectors>, 'getState'>;
    let messenger: Pick<ExtensionMessenger, 'post'>;
    let subscriber: ExtensionChangeSubscriber;
    let subject: ExtensionEventBroadcaster;
    let eventEmitter: EventEmitter;

    beforeEach(() => {
        store = {
            getState: jest.fn(() => ({
                data: {
                    getExtensions,
                },
            })),
        };
        messenger = { post: jest.fn() };
        subscriber = jest.fn();

        subject = new ExtensionEventBroadcaster(
            store as DataStoreProjection<CheckoutSelectors>,
            messenger as ExtensionMessenger,
            {
                [ExtensionEventType.ConsignmentsChanged]: subscriber,
            },
        );

        eventEmitter = new EventEmitter();

        jest.spyOn(window, 'addEventListener').mockImplementation((type, listener) => {
            return eventEmitter.addListener(type, listener);
        });

        jest.spyOn(window, 'removeEventListener').mockImplementation((type, listener) => {
            return eventEmitter.removeListener(type, listener);
        });
    });

    it('listens to subscribe command', () => {
        const extensions = getExtensions();

        subject.listen();

        expect(subscriber).not.toHaveBeenCalled();

        eventEmitter.emit('message', {
            origin: new URL(extensions[0].url).origin,
            data: {
                type: ExtensionInternalCommandType.Subscribe,
                payload: {
                    eventType: ExtensionEventType.ConsignmentsChanged,
                    extensionId: extensions[0].id,
                },
            },
        });

        expect(subscriber).toHaveBeenCalled();
    });

    it('broadcasts event to subscribed extensions', () => {
        const extensions = getExtensions();

        subject.listen();

        eventEmitter.emit('message', {
            origin: new URL(extensions[0].url).origin,
            data: {
                type: ExtensionInternalCommandType.Subscribe,
                payload: {
                    eventType: ExtensionEventType.ConsignmentsChanged,
                    extensionId: extensions[0].id,
                },
            },
        });

        const event = {
            type: ExtensionEventType.ConsignmentsChanged,
            payload: {
                consignments: getConsignments(),
                previousConsignments: [],
            },
        };

        subject.broadcast(event);

        expect(messenger.post).toHaveBeenCalledWith(extensions[0].id, event);
    });

    it('listens to unsubscribe command', () => {
        const extensions = getExtensions();

        subject.listen();

        eventEmitter.emit('message', {
            origin: new URL(extensions[0].url).origin,
            data: {
                type: ExtensionInternalCommandType.Subscribe,
                payload: {
                    eventType: ExtensionEventType.ConsignmentsChanged,
                    extensionId: extensions[0].id,
                },
            },
        });

        eventEmitter.emit('message', {
            origin: new URL(extensions[0].url).origin,
            data: {
                type: ExtensionInternalCommandType.Unsubscribe,
                payload: {
                    eventType: ExtensionEventType.ConsignmentsChanged,
                    extensionId: extensions[0].id,
                },
            },
        });

        const event = {
            type: ExtensionEventType.ConsignmentsChanged,
            payload: {
                consignments: getConsignments(),
                previousConsignments: [],
            },
        };

        subject.broadcast(event);

        expect(messenger.post).not.toHaveBeenCalledWith(extensions[0].id, event);
    });
});
