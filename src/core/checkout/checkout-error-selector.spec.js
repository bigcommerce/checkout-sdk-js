import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart';
import { CountrySelector } from '../geography';
import { CouponSelector, GiftCertificateSelector } from '../coupon';
import { CustomerSelector } from '../customer';
import { OrderSelector } from '../order';
import { PaymentMethodSelector } from '../payment';
import { InstrumentSelector } from '../payment/instrument';
import { QuoteSelector } from '../quote';
import { ShippingAddressSelector, ShippingCountrySelector, ShippingOptionSelector } from '../shipping';
import { getErrorResponseBody } from '../common/http-request/responses.mock';
import CheckoutErrorSelector from './checkout-error-selector';

describe('CheckoutErrorSelector', () => {
    let billingAddress;
    let cart;
    let countries;
    let coupon;
    let customer;
    let giftCertificate;
    let instruments;
    let errorResponse;
    let errors;
    let order;
    let paymentMethods;
    let quote;
    let shippingAddress;
    let shippingCountries;
    let shippingOptions;

    beforeEach(() => {
        billingAddress = new BillingAddressSelector();
        cart = new CartSelector();
        countries = new CountrySelector();
        coupon = new CouponSelector();
        customer = new CustomerSelector();
        giftCertificate = new GiftCertificateSelector();
        instruments = new InstrumentSelector();
        order = new OrderSelector();
        paymentMethods = new PaymentMethodSelector();
        quote = new QuoteSelector();
        shippingAddress = new ShippingAddressSelector();
        shippingCountries = new ShippingCountrySelector();
        shippingOptions = new ShippingOptionSelector();

        errors = new CheckoutErrorSelector(
            billingAddress,
            cart,
            countries,
            coupon,
            customer,
            giftCertificate,
            instruments,
            order,
            paymentMethods,
            quote,
            shippingAddress,
            shippingCountries,
            shippingOptions
        );

        errorResponse = getErrorResponseBody();
    });

    describe('#getLoadCheckoutError()', () => {
        it('returns error if there is an error when loading quote', () => {
            jest.spyOn(quote, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadCheckoutError()).toEqual(errorResponse);
            expect(quote.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading quote', () => {
            jest.spyOn(quote, 'getLoadError').mockReturnValue();

            expect(errors.getLoadCheckoutError()).toEqual(undefined);
            expect(quote.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getSubmitOrderError()', () => {
        it('returns error if there is an error when submitting order', () => {
            jest.spyOn(order, 'getSubmitError').mockReturnValue(errorResponse);

            expect(errors.getSubmitOrderError()).toEqual(errorResponse);
            expect(order.getSubmitError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when submitting order', () => {
            jest.spyOn(order, 'getSubmitError').mockReturnValue();

            expect(errors.getSubmitOrderError()).toEqual(undefined);
            expect(order.getSubmitError).toHaveBeenCalled();
        });
    });

    describe('#getFinalizeOrderError()', () => {
        it('returns error if there is an error when finalizing order', () => {
            jest.spyOn(order, 'getFinalizeError').mockReturnValue(errorResponse);

            expect(errors.getFinalizeOrderError()).toEqual(errorResponse);
            expect(order.getFinalizeError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when finalizing order', () => {
            jest.spyOn(order, 'getFinalizeError').mockReturnValue();

            expect(errors.getFinalizeOrderError()).toEqual(undefined);
            expect(order.getFinalizeError).toHaveBeenCalled();
        });
    });

    describe('#getLoadOrderError()', () => {
        it('returns error if there is an error when loading order', () => {
            jest.spyOn(order, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadOrderError()).toEqual(errorResponse);
            expect(order.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading order', () => {
            jest.spyOn(order, 'getLoadError').mockReturnValue();

            expect(errors.getLoadOrderError()).toEqual(undefined);
            expect(order.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getLoadCartError()', () => {
        it('returns error if there is an error when loading cart', () => {
            jest.spyOn(cart, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadCartError()).toEqual(errorResponse);
            expect(cart.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading cart', () => {
            jest.spyOn(cart, 'getLoadError').mockReturnValue();

            expect(errors.getLoadCartError()).toEqual(undefined);
            expect(cart.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getVerifyCartError()', () => {
        it('returns error if there is an error when verifying cart', () => {
            jest.spyOn(cart, 'getVerifyError').mockReturnValue(errorResponse);

            expect(errors.getVerifyCartError()).toEqual(errorResponse);
            expect(cart.getVerifyError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when verifying cart', () => {
            jest.spyOn(cart, 'getVerifyError').mockReturnValue();

            expect(errors.getVerifyCartError()).toEqual(undefined);
            expect(cart.getVerifyError).toHaveBeenCalled();
        });
    });

    describe('#getLoadBillingCountriesError()', () => {
        it('returns error if there is an error when loading billing countries', () => {
            jest.spyOn(countries, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadBillingCountriesError()).toEqual(errorResponse);
            expect(countries.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading billing countries', () => {
            jest.spyOn(countries, 'getLoadError').mockReturnValue();

            expect(errors.getLoadBillingCountriesError()).toEqual(undefined);
            expect(countries.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getLoadShippingCountriesError()', () => {
        it('returns error if there is an error when loading shipping countries', () => {
            jest.spyOn(shippingCountries, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadShippingCountriesError()).toEqual(errorResponse);
            expect(shippingCountries.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading shipping countries', () => {
            jest.spyOn(shippingCountries, 'getLoadError').mockReturnValue();

            expect(errors.getLoadShippingCountriesError()).toEqual(undefined);
            expect(shippingCountries.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getLoadPaymentMethodsError()', () => {
        it('returns error if there is an error when loading payment methods', () => {
            jest.spyOn(paymentMethods, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadPaymentMethodsError()).toEqual(errorResponse);
            expect(paymentMethods.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading payment methods', () => {
            jest.spyOn(paymentMethods, 'getLoadError').mockReturnValue();

            expect(errors.getLoadPaymentMethodsError()).toEqual(undefined);
            expect(paymentMethods.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getLoadPaymentMethodError()', () => {
        it('returns error if there is an error when loading payment method', () => {
            jest.spyOn(paymentMethods, 'getLoadMethodError').mockReturnValue(errorResponse);

            expect(errors.getLoadPaymentMethodError('braintree')).toEqual(errorResponse);
            expect(paymentMethods.getLoadMethodError).toHaveBeenCalledWith('braintree');
        });

        it('returns undefined if there is no error when loading payment method', () => {
            jest.spyOn(paymentMethods, 'getLoadMethodError').mockReturnValue();

            expect(errors.getLoadPaymentMethodError('braintree')).toEqual(undefined);
            expect(paymentMethods.getLoadMethodError).toHaveBeenCalledWith('braintree');
        });
    });

    describe('#getSignInError()', () => {
        it('returns error if there is an error when signing in', () => {
            jest.spyOn(customer, 'getSignInError').mockReturnValue(errorResponse);

            expect(errors.getSignInError()).toEqual(errorResponse);
            expect(customer.getSignInError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when signing in', () => {
            jest.spyOn(customer, 'getSignInError').mockReturnValue();

            expect(errors.getSignInError()).toEqual(undefined);
            expect(customer.getSignInError).toHaveBeenCalled();
        });
    });

    describe('#getSignOutError()', () => {
        it('returns error if there is an error when signing out', () => {
            jest.spyOn(customer, 'getSignOutError').mockReturnValue(errorResponse);

            expect(errors.getSignOutError()).toEqual(errorResponse);
            expect(customer.getSignOutError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when signing out', () => {
            jest.spyOn(customer, 'getSignOutError').mockReturnValue();

            expect(errors.getSignOutError()).toEqual(undefined);
            expect(customer.getSignOutError).toHaveBeenCalled();
        });
    });

    describe('#getLoadShippingOptionsError()', () => {
        it('returns error if there is an error when loading the shipping options', () => {
            jest.spyOn(shippingOptions, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadShippingOptionsError()).toEqual(errorResponse);
            expect(shippingOptions.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when loading the shipping options', () => {
            jest.spyOn(shippingOptions, 'getLoadError').mockReturnValue();

            expect(errors.getLoadShippingOptionsError()).toEqual(undefined);
            expect(shippingOptions.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getSelectShippingOptionError()', () => {
        it('returns error if there is an error when selecting the shipping options', () => {
            jest.spyOn(shippingOptions, 'getSelectError').mockReturnValue(errorResponse);

            expect(errors.getSelectShippingOptionError()).toEqual(errorResponse);
            expect(shippingOptions.getSelectError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when selecting the shipping options', () => {
            jest.spyOn(shippingOptions, 'getSelectError').mockReturnValue();

            expect(errors.getSelectShippingOptionError()).toEqual(undefined);
            expect(shippingOptions.getSelectError).toHaveBeenCalled();
        });
    });

    describe('#getUpdateBillingAddressError()', () => {
        it('returns error if there is an error when updating the billing address', () => {
            jest.spyOn(billingAddress, 'getUpdateError').mockReturnValue(errorResponse);

            expect(errors.getUpdateBillingAddressError()).toEqual(errorResponse);
            expect(billingAddress.getUpdateError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when updating the billing address', () => {
            jest.spyOn(billingAddress, 'getUpdateError').mockReturnValue();

            expect(errors.getUpdateBillingAddressError()).toEqual(undefined);
            expect(billingAddress.getUpdateError).toHaveBeenCalled();
        });
    });

    describe('#getUpdateShippingAddressError()', () => {
        it('returns error if there is an error when updating the shipping address', () => {
            jest.spyOn(shippingAddress, 'getUpdateError').mockReturnValue(errorResponse);

            expect(errors.getUpdateShippingAddressError()).toEqual(errorResponse);
            expect(shippingAddress.getUpdateError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when updating the shipping address', () => {
            jest.spyOn(shippingAddress, 'getUpdateError').mockReturnValue();

            expect(errors.getUpdateShippingAddressError()).toEqual(undefined);
            expect(shippingAddress.getUpdateError).toHaveBeenCalled();
        });
    });

    describe('#getApplyCouponError()', () => {
        it('returns error if there is an error when updating the a coupon', () => {
            jest.spyOn(coupon, 'getApplyError').mockReturnValue(errorResponse);

            expect(errors.getApplyCouponError()).toEqual(errorResponse);
            expect(coupon.getApplyError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when updating the a coupon', () => {
            jest.spyOn(coupon, 'getApplyError').mockReturnValue();

            expect(errors.getApplyCouponError()).toEqual(undefined);
            expect(coupon.getApplyError).toHaveBeenCalled();
        });
    });

    describe('#getRemoveCouponError()', () => {
        it('returns error if there is an error when updating the a coupon', () => {
            jest.spyOn(coupon, 'getRemoveError').mockReturnValue(errorResponse);

            expect(errors.getRemoveCouponError()).toEqual(errorResponse);
            expect(coupon.getRemoveError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when updating the a coupon', () => {
            jest.spyOn(coupon, 'getRemoveError').mockReturnValue();

            expect(errors.getRemoveCouponError()).toEqual(undefined);
            expect(coupon.getRemoveError).toHaveBeenCalled();
        });
    });

    describe('#getLoadInstrumentsError()', () => {
        it('returns error if there is an error when loading instruments', () => {
            jest.spyOn(instruments, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadInstrumentsError()).toEqual(errorResponse);
            expect(instruments.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when loading instruments', () => {
            jest.spyOn(instruments, 'getLoadError').mockReturnValue();

            expect(errors.getLoadInstrumentsError()).toEqual(undefined);
            expect(instruments.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getVaultInstrumentError()', () => {
        it('returns error if there is an error when vaulting instruments', () => {
            jest.spyOn(instruments, 'getVaultError').mockReturnValue(errorResponse);

            expect(errors.getVaultInstrumentError()).toEqual(errorResponse);
            expect(instruments.getVaultError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when vaulting instruments', () => {
            jest.spyOn(instruments, 'getVaultError').mockReturnValue();

            expect(errors.getVaultInstrumentError()).toEqual(undefined);
            expect(instruments.getVaultError).toHaveBeenCalled();
        });
    });

    describe('#getDeleteInstrumentError()', () => {
        it('returns error if there is an error when deleting instruments', () => {
            jest.spyOn(instruments, 'getDeleteError').mockReturnValue(errorResponse);

            expect(errors.getDeleteInstrumentError('123')).toEqual(errorResponse);
            expect(instruments.getDeleteError).toHaveBeenCalledWith('123');
        });

        it('returns undefined if there is NO error when deleting instruments', () => {
            jest.spyOn(instruments, 'getDeleteError').mockReturnValue();

            expect(errors.getDeleteInstrumentError('123')).toEqual(undefined);
            expect(instruments.getDeleteError).toHaveBeenCalledWith('123');
        });
    });
});
