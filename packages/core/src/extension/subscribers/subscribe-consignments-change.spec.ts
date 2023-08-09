import EventEmitter from 'events';

import { CheckoutSelectors } from '../../checkout';
import { DataStoreProjection } from '../../common/data-store';
import { getConsignment } from '../../shipping/consignments.mock';
import { getShippingAddress } from '../../shipping/shipping-addresses.mock';
import { ExtensionEventType } from '../extension-client';
import { ExtensionEventBroadcaster } from '../extension-event-broadcaster';

import { subscribeConsignmentsChange } from './subscribe-consignments-change';

describe('subscribeConsignmentsChange', () => {
    let store: Pick<DataStoreProjection<CheckoutSelectors>, 'getState' | 'subscribe'>;
    let broadcaster: Pick<ExtensionEventBroadcaster, 'broadcast'>;
    let eventEmitter: EventEmitter;

    beforeEach(() => {
        eventEmitter = new EventEmitter();

        store = {
            getState: jest.fn(() => ({
                data: {
                    getConsignments: () => [getConsignment()],
                },
            })),
            subscribe: jest.fn((listener) => {
                eventEmitter.addListener('change', listener);

                return () => {
                    eventEmitter.removeListener('change', listener);
                };
            }),
        };

        broadcaster = {
            broadcast: jest.fn(),
        };
    });

    it('subscribes to state change', () => {
        const consignment = getConsignment();

        subscribeConsignmentsChange(
            store as DataStoreProjection<CheckoutSelectors>,
            broadcaster as ExtensionEventBroadcaster,
        );

        expect(store.subscribe).toHaveBeenCalled();

        const newConsignment = {
            ...consignment,
            address: {
                ...getShippingAddress(),
                countryCode: 'AU',
            },
        };

        eventEmitter.emit('change', {
            data: {
                getConsignments: () => [newConsignment],
            },
        });

        expect(broadcaster.broadcast).toHaveBeenCalledWith({
            type: ExtensionEventType.ConsignmentsChanged,
            payload: {
                consignments: [newConsignment],
                previousConsignments: [consignment],
            },
        });
    });
});
