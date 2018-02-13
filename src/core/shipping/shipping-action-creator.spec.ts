import ShippingActionCreator from './shipping-action-creator';
import * as actionTypes from './shipping-action-types';
import 'rxjs/add/operator/toArray';
import 'rxjs/add/operator/toPromise';

describe('ShippingActionCreator', () => {
    let actionCreator: ShippingActionCreator;

    beforeEach(() => {
        actionCreator = new ShippingActionCreator();
    });

    it('calls initializer and notifies progress', async () => {
        const initializer = jest.fn(() => Promise.resolve(true));
        const actions = await actionCreator.initializeShipping('foobar', initializer)
            .toArray()
            .toPromise();

        expect(initializer).toHaveBeenCalled();
        expect(actions).toEqual([
            { type: actionTypes.INITIALIZE_SHIPPING_REQUESTED, meta: { methodId: 'foobar' } },
            { type: actionTypes.INITIALIZE_SHIPPING_SUCCEEDED, payload: true, meta: { methodId: 'foobar' } },
        ]);
    });

    it('emits error if initializer fails to complete', async () => {
        const initializer = jest.fn(() => Promise.reject(false));

        try {
            const actions = await actionCreator.initializeShipping('foobar', initializer)
                .toArray()
                .toPromise();

            expect(actions).toEqual([
                { type: actionTypes.INITIALIZE_SHIPPING_REQUESTED, meta: { methodId: 'foobar' } },
            ]);
        } catch (error) {
            expect(error).toEqual(
                { type: actionTypes.INITIALIZE_SHIPPING_FAILED, error: true, payload: false, meta: { methodId: 'foobar' } }
            );
        }
    });
});
