import {
    createAction,
    createErrorAction,
    ReadableDataStore,
    ThunkAction,
} from '@bigcommerce/data-store';
import { includes } from 'lodash';
import { Observable, Observer } from 'rxjs';

import { LineItem } from '../cart';
import { InternalCheckoutSelectors } from '../checkout';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';

import { PickupOptionAPIRequestBody, PickupOptionRequestBody } from './pickup-option';
import { LoadPickupOptionsAction, PickupOptionActionType } from './pickup-option-actions';
import PickupOptionRequestSender from './pickup-option-request-sender';

export default class PickupOptionActionCreator {
    constructor(private _pickupOptionRequestSender: PickupOptionRequestSender) {}

    loadPickupOptions(
        query: PickupOptionRequestBody,
    ): ThunkAction<LoadPickupOptionsAction, InternalCheckoutSelectors> {
        return (store) =>
            new Observable((observer: Observer<LoadPickupOptionsAction>) => {
                const apiQuery = this._hydrateApiQuery(store, query);

                observer.next(createAction(PickupOptionActionType.LoadPickupOptionsRequested));

                this._pickupOptionRequestSender
                    .fetchPickupOptions(apiQuery)
                    .then((response) => {
                        observer.next(
                            createAction(
                                PickupOptionActionType.LoadPickupOptionsSucceeded,
                                response.body.results,
                                query,
                            ),
                        );
                        observer.complete();
                    })
                    .catch((response) => {
                        observer.error(
                            createErrorAction(
                                PickupOptionActionType.LoadPickupOptionsFailed,
                                response,
                            ),
                        );
                    });
            });
    }

    private _hydrateApiQuery(
        store: ReadableDataStore<InternalCheckoutSelectors>,
        query: PickupOptionRequestBody,
    ): PickupOptionAPIRequestBody {
        const state = store.getState();
        const cart = state.cart.getCartOrThrow();

        if (!cart) {
            throw new MissingDataError(MissingDataErrorType.MissingCart);
        }

        const consignment = state.consignments.getConsignmentById(query.consignmentId);

        if (!consignment) {
            throw new MissingDataError(MissingDataErrorType.MissingConsignments);
        }

        const consignmentLineItems = consignment.lineItemIds;
        const physicalItems = cart.lineItems.physicalItems;
        const cartItems = physicalItems
            .filter((item: LineItem) => includes(consignmentLineItems, item.id))
            .map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
            }));

        return {
            searchArea: query.searchArea,
            items: cartItems,
        };
    }
}
