import { InternalCheckoutSelectors, ReadableCheckoutStore } from '../../checkout';
import { ExtensionEventType } from '../extension-client';
import { ExtensionEventBroadcaster } from '../extension-event-broadcaster';

import { ExtensionChangeSubscriber } from './extension-change-subscriber';

export const subscribeShippingCountryChange: ExtensionChangeSubscriber = (
    store: ReadableCheckoutStore,
    broadcaster: ExtensionEventBroadcaster,
) => {
    let countryCodes: Record<string, string> = getShippingCountryCodes(store.getState());

    return store.subscribe(
        (state) => {
            const currentCountryCodes = getShippingCountryCodes(state);

            Object.keys(currentCountryCodes).forEach((consignmentId) => {
                if (currentCountryCodes[consignmentId] === countryCodes[consignmentId]) {
                    return;
                }

                broadcaster.broadcast({
                    type: ExtensionEventType.ShippingCountryChanged,
                    payload: {
                        consignmentId,
                        countryCode: currentCountryCodes[consignmentId],
                    },
                });
            });

            countryCodes = currentCountryCodes;
        },
        ({ consignments: { getConsignments } }) => getConsignments(),
    );
};

function getShippingCountryCodes({ consignments: { getConsignments } }: InternalCheckoutSelectors) {
    return (getConsignments() ?? []).reduce(
        (carry: Record<string, string>, consignment) =>
            consignment.selectedPickupOption
                ? carry
                : { ...carry, [consignment.id]: consignment.address.countryCode },
        {},
    );
}
