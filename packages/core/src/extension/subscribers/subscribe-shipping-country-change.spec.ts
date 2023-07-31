import EventEmitter from 'events';

import { ReadableCheckoutStore } from '../../checkout';
import { getConsignment } from '../../shipping/consignments.mock';
import { getShippingAddress } from '../../shipping/shipping-addresses.mock';
import { ExtensionEventType } from '../extension-client';
import { ExtensionEventBroadcaster } from '../extension-event-broadcaster';

import { subscribeShippingCountryChange } from './subscribe-shipping-country-change';

describe('subscribeShippingCountryChange', () => {
    let store: Pick<ReadableCheckoutStore, 'getState' | 'subscribe'>;
    let broadcaster: Pick<ExtensionEventBroadcaster, 'broadcast'>;
    let eventEmitter: EventEmitter;

    beforeEach(() => {
        eventEmitter = new EventEmitter();

        store = {
            getState: jest.fn(() => ({
                consignments: {
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

        subscribeShippingCountryChange(
            store as ReadableCheckoutStore,
            broadcaster as ExtensionEventBroadcaster,
        );

        expect(store.subscribe).toHaveBeenCalled();

        eventEmitter.emit('change', {
            consignments: {
                getConsignments: () => [
                    {
                        ...consignment,
                        address: {
                            ...getShippingAddress(),
                            countryCode: 'AU',
                        },
                    },
                ],
            },
        });

        expect(broadcaster.broadcast).toHaveBeenCalledWith({
            type: ExtensionEventType.ShippingCountryChanged,
            payload: {
                consignmentId: consignment.id,
                countryCode: 'AU',
            },
        });
    });
});
