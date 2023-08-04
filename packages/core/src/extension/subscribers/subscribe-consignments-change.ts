import { CheckoutSelectors } from '../../checkout';
import { DataStoreProjection } from '../../common/data-store';
import { ExtensionEventType } from '../extension-client';
import { ExtensionEventBroadcaster } from '../extension-event-broadcaster';

import { ExtensionChangeSubscriber } from './extension-change-subscriber';

export const subscribeConsignmentsChange: ExtensionChangeSubscriber = (
    store: DataStoreProjection<CheckoutSelectors>,
    broadcaster: ExtensionEventBroadcaster,
) => {
    const {
        data: { getConsignments: getInitialConsignments },
    } = store.getState();

    let consignments = getInitialConsignments() ?? [];

    return store.subscribe(
        ({ data: { getConsignments } }) => {
            const currentConsignments = getConsignments() ?? [];

            if (currentConsignments === consignments) {
                return;
            }

            broadcaster.broadcast({
                type: ExtensionEventType.ConsignmentsChanged,
                payload: {
                    consignments: currentConsignments,
                    previousConsignments: consignments,
                },
            });

            consignments = currentConsignments;
        },
        ({ data: { getConsignments } }) => getConsignments(),
    );
};
