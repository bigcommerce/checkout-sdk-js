import { createRequestSender } from '@bigcommerce/request-sender';

import { getCart } from '../cart/carts.mock';
import { CartChangedError } from '../cart/errors';
import { MissingDataError } from '../common/error/errors';
import { getResponse } from '../common/http-request/responses.mock';
import { getCoupon } from '../coupon/coupons.mock';
import { getGiftCertificate } from '../coupon/gift-certificates.mock';

import CheckoutRequestSender from './checkout-request-sender';
import CheckoutValidator from './checkout-validator';
import { getCheckout } from './checkouts.mock';

describe('CheckoutValidator', () => {
    const checkoutRequestSender = new CheckoutRequestSender(createRequestSender());
    const checkoutValidator = new CheckoutValidator(checkoutRequestSender);
    const checkout = getCheckout();

    describe('validate()', () => {
        beforeEach(() => {
            jest.spyOn(checkoutRequestSender, 'loadCheckout')
                .mockReturnValue(Promise.resolve(getResponse(getCheckout())));
        });

        it('throws when no cart is passed', () => {
            expect(() => checkoutValidator.validate()).toThrowError(MissingDataError);
        });

        it('calls loadCheckout when cart is passed', () => {
            checkoutValidator.validate(checkout, {});

            expect(checkoutRequestSender.loadCheckout).toHaveBeenCalledWith('b20deef40f9699e48671bbc3fef6ca44dc80e3c7', {});
        });

        describe('when API request fails', () => {
            beforeEach(() => {
                jest.spyOn(checkoutRequestSender, 'loadCheckout')
                    .mockReturnValue(Promise.reject({ foo: 'bar' }));
            });

            it('returns a rejected promise containing the original reason', async () => {
                const errorHandler = jest.fn(() => {});

                await checkoutValidator.validate(checkout, {})
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

                await checkoutValidator.validate(checkout)
                    .then(successHandler);

                expect(successHandler).toHaveBeenCalled();
            });

            it('rejects with "cart changed error" when carts do not match', async () => {
                const errorHandler = jest.fn(() => {});
                const cart = getCart();

                await checkoutValidator.validate({
                    ...checkout,
                    cart: {
                        ...cart,
                        lineItems: {
                            ...cart.lineItems,
                            physicalItems: [],
                        },
                    },
                })
                    .catch(errorHandler);

                expect(errorHandler).toHaveBeenCalledWith(new CartChangedError());
            });

            it('rejects with "cart changed error" if outstandingBalance are different', async () => {
                try {
                    await checkoutValidator.validate({
                        ...checkout,
                        outstandingBalance: 10,
                    });
                } catch (error) {
                    expect(error).toBeInstanceOf(CartChangedError);
                }
            });

            it('rejects with "cart changed error" if coupons are different', async () => {
                try {
                    await checkoutValidator.validate({
                        ...checkout,
                        coupons: [getCoupon(), getCoupon()],
                    });
                } catch (error) {
                    expect(error).toBeInstanceOf(CartChangedError);
                }
            });

            it('rejects with "cart changed error" if gift certificates are different', async () => {
                try {
                    await checkoutValidator.validate({
                        ...checkout,
                        giftCertificates: [getGiftCertificate(), getGiftCertificate()],
                    });
                } catch (error) {
                    expect(error).toBeInstanceOf(CartChangedError);
                }
            });

            it('does not reject "cart changed error" if only update timestamp is different', async () => {
                await expect(checkoutValidator.validate({
                    ...checkout,
                    updatedTime: '2018-06-01T14:31:40+00:00',
                })).resolves.toBeUndefined();
            });
        });
    });
});
