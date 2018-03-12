import { createTimeout } from '@bigcommerce/request-sender';
import { Observable } from 'rxjs';
import { getShippingOptions } from '../shipping/internal-shipping-options.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import * as actionTypes from './shipping-option-action-types';
import ShippingOptionActionCreator from './shipping-option-action-creator';

describe('ShippingOptionActionCreator', () => {
    let checkoutClient;
    let shippingOptionActionCreator;
    let errorResponse;
    let response;

    beforeEach(() => {
        response = getResponse({ data: getShippingOptions() });
        errorResponse = getErrorResponse();

        checkoutClient = {
            loadShippingOptions: jest.fn(() => Promise.resolve(response)),
            selectShippingOption: jest.fn(() => Promise.resolve(response)),
        };

        shippingOptionActionCreator = new ShippingOptionActionCreator(checkoutClient);
    });

    describe('#loadShippingOptions()', () => {
        it('emits actions if able to load shipping options', () => {
            shippingOptionActionCreator.loadShippingOptions()
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_SHIPPING_OPTIONS_REQUESTED },
                        { type: actionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to load shipping options', () => {
            checkoutClient.loadShippingOptions.mockImplementation(() => Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));

            shippingOptionActionCreator.loadShippingOptions()
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_SHIPPING_OPTIONS_REQUESTED },
                        { type: actionTypes.LOAD_SHIPPING_OPTIONS_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });

        it('loads shipping options', async () => {
            await shippingOptionActionCreator.loadShippingOptions().toPromise();

            expect(checkoutClient.loadShippingOptions).toHaveBeenCalledWith(undefined);
        });

        it('loads shipping options with timeout', async () => {
            const options = { timeout: createTimeout() };

            await shippingOptionActionCreator.loadShippingOptions(options).toPromise();

            expect(checkoutClient.loadShippingOptions).toHaveBeenCalledWith(options);
        });
    });

    describe('#selectShippingOption()', () => {
        let addressId;
        let shippingOptionId;
        let options;

        beforeEach(() => {
            addressId = 'address-id-12';
            shippingOptionId = 'shipping-option-id-33';
            options = { timeout: createTimeout() };
        });

        it('emits actions if able to select shipping option', () => {
            shippingOptionActionCreator.selectShippingOption(addressId, shippingOptionId, options)
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.SELECT_SHIPPING_OPTION_REQUESTED },
                        { type: actionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to select shipping option', () => {
            checkoutClient.selectShippingOption.mockImplementation(() => Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));

            shippingOptionActionCreator.selectShippingOption()
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.SELECT_SHIPPING_OPTION_REQUESTED },
                        { type: actionTypes.SELECT_SHIPPING_OPTION_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });

        it('sends request to select shipping option', async () => {
            await shippingOptionActionCreator.selectShippingOption(addressId, shippingOptionId, options).toPromise();

            expect(checkoutClient.selectShippingOption)
                .toHaveBeenCalledWith(addressId, shippingOptionId, options);
        });
    });
});
