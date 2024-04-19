import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { getCart } from '../cart/carts.mock';
import { CheckoutStore, createCheckoutStore } from '../checkout';
import { getCheckoutState } from '../checkout/checkouts.mock';
import { MissingDataError } from '../common/error/errors';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import { getConsignment } from './consignments.mock';
import PickupOptionActionCreator from './pickup-option-action-creator';
import { PickupOptionActionType } from './pickup-option-actions';
import PickupOptionRequestSender from './pickup-option-request-sender';
import {
    getApiQueryForPickupOptions,
    getPickupOptionsResponseBody,
    getQueryForPickupOptions,
} from './pickup-option.mock';

describe('PickupOptionActionCreator', () => {
    let pickupOptionRequestSender: PickupOptionRequestSender;
    let pickupOptionActionCreator: PickupOptionActionCreator;
    let errorResponse: Response<Error>;
    let response: Response<any>;
    let store: CheckoutStore;

    beforeEach(() => {
        response = getResponse(getPickupOptionsResponseBody());
        errorResponse = getErrorResponse();
        store = createCheckoutStore({
            checkout: getCheckoutState(),
        });

        pickupOptionRequestSender = new PickupOptionRequestSender(createRequestSender());
        pickupOptionActionCreator = new PickupOptionActionCreator(pickupOptionRequestSender);

        jest.spyOn(pickupOptionRequestSender, 'fetchPickupOptions').mockReturnValue(
            Promise.resolve(response),
        );
    });

    it('emits actions if able to fetch pickup options', async () => {
        jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(getCart());

        const consignment = getConsignment();

        consignment.lineItemIds.pop();

        const id = getCart().lineItems.physicalItems[0].id;

        consignment.lineItemIds.push(id.toString());
        jest.spyOn(store.getState().consignments, 'getConsignmentById').mockReturnValue(
            consignment,
        );

        const query = getQueryForPickupOptions();
        const actions = await from(pickupOptionActionCreator.loadPickupOptions(query)(store))
            .pipe(toArray())
            .toPromise();

        expect(pickupOptionRequestSender.fetchPickupOptions).toHaveBeenCalledWith(
            getApiQueryForPickupOptions(),
        );

        expect(actions).toEqual([
            { type: PickupOptionActionType.LoadPickupOptionsRequested },
            {
                type: PickupOptionActionType.LoadPickupOptionsSucceeded,
                payload: response.body.results,
                meta: query,
            },
        ]);
    });

    it('throws an exception when there is no cart', async () => {
        try {
            await from(
                pickupOptionActionCreator.loadPickupOptions(getQueryForPickupOptions())(store),
            )
                .pipe(toArray())
                .toPromise();
        } catch (exception) {
            expect(exception).toBeInstanceOf(MissingDataError);
        }
    });

    it('throws an exception when there is no consignment', async () => {
        jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(getCart());

        try {
            await from(
                pickupOptionActionCreator.loadPickupOptions(getQueryForPickupOptions())(store),
            )
                .pipe(toArray())
                .toPromise();
        } catch (exception) {
            expect(exception).toBeInstanceOf(MissingDataError);
        }
    });

    it('emits error actions if unable to fetch pickup options', async () => {
        jest.spyOn(store.getState().cart, 'getCartOrThrow').mockReturnValue(getCart());

        const consignment = getConsignment();

        consignment.lineItemIds.pop();

        const id = getCart().lineItems.physicalItems[0].id;

        consignment.lineItemIds.push(id.toString());
        jest.spyOn(store.getState().consignments, 'getConsignmentById').mockReturnValue(
            consignment,
        );
        jest.spyOn(pickupOptionRequestSender, 'fetchPickupOptions').mockReturnValue(
            Promise.reject(errorResponse),
        );

        const errorHandler = jest.fn((action) => of(action));

        await from(pickupOptionActionCreator.loadPickupOptions(getQueryForPickupOptions())(store))
            .pipe(catchError(errorHandler), toArray())
            .subscribe((actions) => {
                expect(actions).toEqual([
                    { type: PickupOptionActionType.LoadPickupOptionsRequested },
                    {
                        type: PickupOptionActionType.LoadPickupOptionsFailed,
                        payload: errorResponse,
                        error: true,
                    },
                ]);
            });
    });
});
