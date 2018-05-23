import { createRequestSender } from '@bigcommerce/request-sender';

import { CartChangedError } from '../cart/errors';
import { getCart } from '../cart/internal-carts.mock';
import { MissingDataError } from '../common/error/errors';
import { getResponse } from '../common/http-request/responses.mock';

import CheckoutRequestSender from './checkout-request-sender';
import CheckoutValidator from './checkout-validator';
import { getCheckout } from './checkouts.mock';

describe('CheckoutValidator', () => {
    const checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
    const checkoutValidator = new CheckoutValidator(checkoutRequestSender);
    const cart = getCart();

    describe('validate()', () => {
        beforeEach(() => {
            jest.spyOn(checkoutRequestSender, 'loadCheckout')
                .mockReturnValue(Promise.resolve(getResponse(getCheckout())));
        });

        it('throws when no cart is passed', () => {
            expect(() => checkoutValidator.validate()).toThrowError(MissingDataError);
        });

        it('calls loadCheckout when cart is passed', () => {
            checkoutValidator.validate(cart, {});

            expect(checkoutRequestSender.loadCheckout).toHaveBeenCalledWith('b20deef40f9699e48671bbc3fef6ca44dc80e3c7', {});
        });

        describe('when API request fails', () => {
            beforeEach(() => {
                jest.spyOn(checkoutRequestSender, 'loadCheckout')
                    .mockReturnValue(Promise.reject({ foo: 'bar' }));
            });

            it('returns a rejected promise containing the original reason', async () => {
                const errorHandler = jest.fn(() => {});

                await checkoutValidator.validate(cart, {})
                    .catch(errorHandler);

                expect(errorHandler).toHaveBeenCalledWith({ foo: 'bar' });
            });
        });

        describe('when API request succeeds', () => {
            beforeEach(() => {
                jest.spyOn(checkoutRequestSender, 'loadCheckout')
                    .mockReturnValue(Promise.resolve(getResponse(getCheckout())));
            });

            it('resolves when cart content matches', async () => {
                const successHandler = jest.fn(() => {});

                await checkoutValidator.validate(cart)
                    .then(successHandler);

                expect(successHandler).toHaveBeenCalled();
            });

            it('rejects with "cart changed error" when carts do not match', async () => {
                const errorHandler = jest.fn(() => {});

                await checkoutValidator.validate({ ...cart, id: 'foo' })
                    .catch(errorHandler);

                expect(errorHandler).toHaveBeenCalledWith(new CartChangedError());
            });
        });
    });
});
