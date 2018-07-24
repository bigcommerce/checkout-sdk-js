import { getCheckoutStoreStateWithOrder } from './checkouts.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import createInternalCheckoutSelectors from './create-internal-checkout-selectors';
import CheckoutStoreErrorSelector from './checkout-store-error-selector';

describe('CheckoutStoreErrorSelector', () => {
    let errorResponse;
    let errors;
    let selectors;

    beforeEach(() => {
        selectors = createInternalCheckoutSelectors(getCheckoutStoreStateWithOrder());
        errors = new CheckoutStoreErrorSelector(selectors);

        errorResponse = getErrorResponse();
    });

    describe('#getLoadCheckoutError()', () => {
        it('returns error if there is an error when loading checkout', () => {
            jest.spyOn(selectors.checkout, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadCheckoutError()).toEqual(errorResponse);
            expect(selectors.checkout.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading checkout', () => {
            jest.spyOn(selectors.checkout, 'getLoadError').mockReturnValue();

            expect(errors.getLoadCheckoutError()).toEqual(undefined);
            expect(selectors.checkout.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getUpdateCheckoutError()', () => {
        it('returns error if there is an error when loading checkout', () => {
            jest.spyOn(selectors.checkout, 'getUpdateError').mockReturnValue(errorResponse);

            expect(errors.getUpdateCheckoutError()).toEqual(errorResponse);
            expect(selectors.checkout.getUpdateError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading checkout', () => {
            jest.spyOn(selectors.checkout, 'getUpdateError').mockReturnValue();

            expect(errors.getUpdateCheckoutError()).toEqual(undefined);
            expect(selectors.checkout.getUpdateError).toHaveBeenCalled();
        });
    });

    describe('#getSubmitOrderError()', () => {
        it('returns error if there is an error when submitting order', () => {
            jest.spyOn(selectors.paymentStrategies, 'getExecuteError').mockReturnValue(errorResponse);

            expect(errors.getSubmitOrderError()).toEqual(errorResponse);
            expect(selectors.paymentStrategies.getExecuteError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when submitting order', () => {
            jest.spyOn(selectors.paymentStrategies, 'getExecuteError').mockReturnValue();

            expect(errors.getSubmitOrderError()).toEqual(undefined);
            expect(selectors.paymentStrategies.getExecuteError).toHaveBeenCalled();
        });
    });

    describe('#getFinalizeOrderError()', () => {
        it('returns error if there is an error when finalizing order', () => {
            jest.spyOn(selectors.paymentStrategies, 'getFinalizeError').mockReturnValue(errorResponse);

            expect(errors.getFinalizeOrderError()).toEqual(errorResponse);
            expect(selectors.paymentStrategies.getFinalizeError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when finalizing order', () => {
            jest.spyOn(selectors.paymentStrategies, 'getFinalizeError').mockReturnValue();

            expect(errors.getFinalizeOrderError()).toEqual(undefined);
            expect(selectors.paymentStrategies.getFinalizeError).toHaveBeenCalled();
        });
    });

    describe('#getLoadOrderError()', () => {
        it('returns error if there is an error when loading order', () => {
            jest.spyOn(selectors.order, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadOrderError()).toEqual(errorResponse);
            expect(selectors.order.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading order', () => {
            jest.spyOn(selectors.order, 'getLoadError').mockReturnValue();

            expect(errors.getLoadOrderError()).toEqual(undefined);
            expect(selectors.order.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getLoadCartError()', () => {
        it('returns error if there is an error when loading cart', () => {
            jest.spyOn(selectors.cart, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadCartError()).toEqual(errorResponse);
            expect(selectors.cart.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading cart', () => {
            jest.spyOn(selectors.cart, 'getLoadError').mockReturnValue();

            expect(errors.getLoadCartError()).toEqual(undefined);
            expect(selectors.cart.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getLoadBillingCountriesError()', () => {
        it('returns error if there is an error when loading billing countries', () => {
            jest.spyOn(selectors.countries, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadBillingCountriesError()).toEqual(errorResponse);
            expect(selectors.countries.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading billing countries', () => {
            jest.spyOn(selectors.countries, 'getLoadError').mockReturnValue();

            expect(errors.getLoadBillingCountriesError()).toEqual(undefined);
            expect(selectors.countries.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getLoadShippingCountriesError()', () => {
        it('returns error if there is an error when loading shipping countries', () => {
            jest.spyOn(selectors.shippingCountries, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadShippingCountriesError()).toEqual(errorResponse);
            expect(selectors.shippingCountries.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading shipping countries', () => {
            jest.spyOn(selectors.shippingCountries, 'getLoadError').mockReturnValue();

            expect(errors.getLoadShippingCountriesError()).toEqual(undefined);
            expect(selectors.shippingCountries.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getLoadPaymentMethodsError()', () => {
        it('returns error if there is an error when loading payment methods', () => {
            jest.spyOn(selectors.paymentMethods, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadPaymentMethodsError()).toEqual(errorResponse);
            expect(selectors.paymentMethods.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading payment methods', () => {
            jest.spyOn(selectors.paymentMethods, 'getLoadError').mockReturnValue();

            expect(errors.getLoadPaymentMethodsError()).toEqual(undefined);
            expect(selectors.paymentMethods.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getLoadPaymentMethodError()', () => {
        it('returns error if there is an error when loading payment method', () => {
            jest.spyOn(selectors.paymentMethods, 'getLoadMethodError').mockReturnValue(errorResponse);

            expect(errors.getLoadPaymentMethodError('braintree')).toEqual(errorResponse);
            expect(selectors.paymentMethods.getLoadMethodError).toHaveBeenCalledWith('braintree');
        });

        it('returns undefined if there is no error when loading payment method', () => {
            jest.spyOn(selectors.paymentMethods, 'getLoadMethodError').mockReturnValue();

            expect(errors.getLoadPaymentMethodError('braintree')).toEqual(undefined);
            expect(selectors.paymentMethods.getLoadMethodError).toHaveBeenCalledWith('braintree');
        });
    });

    describe('#getInitializePaymentError()', () => {
        it('returns error if unable to initialize payment', () => {
            jest.spyOn(selectors.paymentStrategies, 'getInitializeError').mockReturnValue(errorResponse);

            expect(errors.getInitializePaymentError('braintree')).toEqual(errorResponse);
            expect(selectors.paymentStrategies.getInitializeError).toHaveBeenCalledWith('braintree');
        });

        it('returns undefined if able to initialize payment', () => {
            jest.spyOn(selectors.paymentStrategies, 'getInitializeError').mockReturnValue();

            expect(errors.getInitializePaymentError('braintree')).toEqual(undefined);
            expect(selectors.paymentStrategies.getInitializeError).toHaveBeenCalledWith('braintree');
        });
    });

    describe('#getSignInError()', () => {
        it('returns error if there is an error when signing in', () => {
            jest.spyOn(selectors.customerStrategies, 'getSignInError').mockReturnValue(errorResponse);

            expect(errors.getSignInError()).toEqual(errorResponse);
            expect(selectors.customerStrategies.getSignInError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when signing in', () => {
            jest.spyOn(selectors.customerStrategies, 'getSignInError').mockReturnValue();

            expect(errors.getSignInError()).toEqual(undefined);
            expect(selectors.customerStrategies.getSignInError).toHaveBeenCalled();
        });
    });

    describe('#getSignOutError()', () => {
        it('returns error if there is an error when signing out', () => {
            jest.spyOn(selectors.customerStrategies, 'getSignOutError').mockReturnValue(errorResponse);

            expect(errors.getSignOutError()).toEqual(errorResponse);
            expect(selectors.customerStrategies.getSignOutError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when signing out', () => {
            jest.spyOn(selectors.customerStrategies, 'getSignOutError').mockReturnValue();

            expect(errors.getSignOutError()).toEqual(undefined);
            expect(selectors.customerStrategies.getSignOutError).toHaveBeenCalled();
        });
    });

    describe('#getInitializeCustomerError()', () => {
        it('returns error if unable to initialize customer', () => {
            jest.spyOn(selectors.customerStrategies, 'getInitializeError').mockReturnValue(errorResponse);

            expect(errors.getInitializeCustomerError()).toEqual(errorResponse);
            expect(selectors.customerStrategies.getInitializeError).toHaveBeenCalled();
        });

        it('returns undefined if able to initialize customer', () => {
            jest.spyOn(selectors.customerStrategies, 'getInitializeError').mockReturnValue();

            expect(errors.getInitializeCustomerError()).toEqual(undefined);
            expect(selectors.customerStrategies.getInitializeError).toHaveBeenCalled();
        });
    });

    describe('#getLoadShippingOptionsError()', () => {
        it('returns error if there is an error when loading the shipping options', () => {
            jest.spyOn(selectors.consignments, 'getLoadShippingOptionsError').mockReturnValue(errorResponse);

            expect(errors.getLoadShippingOptionsError()).toEqual(errorResponse);
            expect(selectors.consignments.getLoadShippingOptionsError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when loading the shipping options', () => {
            jest.spyOn(selectors.consignments, 'getLoadShippingOptionsError').mockReturnValue();

            expect(errors.getLoadShippingOptionsError()).toEqual(undefined);
            expect(selectors.consignments.getLoadShippingOptionsError).toHaveBeenCalled();
        });
    });

    describe('#getSelectShippingOptionError()', () => {
        it('returns error if there is an error when selecting the shipping options', () => {
            jest.spyOn(selectors.shippingStrategies, 'getSelectOptionError').mockReturnValue(errorResponse);

            expect(errors.getSelectShippingOptionError()).toEqual(errorResponse);
            expect(selectors.shippingStrategies.getSelectOptionError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when selecting the shipping options', () => {
            jest.spyOn(selectors.shippingStrategies, 'getSelectOptionError').mockReturnValue();

            expect(errors.getSelectShippingOptionError()).toEqual(undefined);
            expect(selectors.shippingStrategies.getSelectOptionError).toHaveBeenCalled();
        });
    });

    describe('#getUpdateBillingAddressError()', () => {
        it('returns error if there is an error when updating the billing address', () => {
            jest.spyOn(selectors.billingAddress, 'getUpdateError').mockReturnValue(errorResponse);

            expect(errors.getUpdateBillingAddressError()).toEqual(errorResponse);
            expect(selectors.billingAddress.getUpdateError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when updating the billing address', () => {
            jest.spyOn(selectors.billingAddress, 'getUpdateError').mockReturnValue();

            expect(errors.getUpdateBillingAddressError()).toEqual(undefined);
            expect(selectors.billingAddress.getUpdateError).toHaveBeenCalled();
        });
    });

    describe('#getUpdateConsignmentError()', () => {
        it('returns error if there is an error when updating consignments', () => {
            jest.spyOn(selectors.consignments, 'getUpdateError').mockReturnValue(errorResponse);

            expect(errors.getUpdateConsignmentError('foo')).toEqual(errorResponse);
            expect(selectors.consignments.getUpdateError).toHaveBeenCalledWith('foo');
        });

        it('returns undefined if there is NO error when updating consignments', () => {
            jest.spyOn(selectors.consignments, 'getUpdateError');

            expect(errors.getUpdateConsignmentError('foo')).toEqual(undefined);
            expect(selectors.consignments.getUpdateError).toHaveBeenCalledWith('foo');
        });
    });

    describe('#getCreateConsignmentsError()', () => {
        it('returns error if there is an error when creating consignments', () => {
            jest.spyOn(selectors.consignments, 'getCreateError').mockReturnValue(errorResponse);

            expect(errors.getCreateConsignmentsError()).toEqual(errorResponse);
            expect(selectors.consignments.getCreateError).toHaveBeenCalledWith();
        });

        it('returns undefined if there is NO error when creating consignments', () => {
            jest.spyOn(selectors.consignments, 'getCreateError');

            expect(errors.getCreateConsignmentsError()).toEqual(undefined);
            expect(selectors.consignments.getCreateError).toHaveBeenCalledWith();
        });
    });

    describe('#getUpdateShippingAddressError()', () => {
        it('returns error if there is an error when updating the shipping address', () => {
            jest.spyOn(selectors.shippingStrategies, 'getUpdateAddressError').mockReturnValue(errorResponse);

            expect(errors.getUpdateShippingAddressError()).toEqual(errorResponse);
            expect(selectors.shippingStrategies.getUpdateAddressError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when updating the shipping address', () => {
            jest.spyOn(selectors.shippingStrategies, 'getUpdateAddressError').mockReturnValue();

            expect(errors.getUpdateShippingAddressError()).toEqual(undefined);
            expect(selectors.shippingStrategies.getUpdateAddressError).toHaveBeenCalled();
        });
    });

    describe('#getInitializePaymentError()', () => {
        it('returns error if unable to initialize shipping', () => {
            jest.spyOn(selectors.shippingStrategies, 'getInitializeError').mockReturnValue(errorResponse);

            expect(errors.getInitializeShippingError('foobar')).toEqual(errorResponse);
            expect(selectors.shippingStrategies.getInitializeError).toHaveBeenCalledWith('foobar');
        });

        it('returns undefined if able to initialize shipping', () => {
            jest.spyOn(selectors.shippingStrategies, 'getInitializeError').mockReturnValue();

            expect(errors.getInitializeShippingError('foobar')).toEqual(undefined);
            expect(selectors.shippingStrategies.getInitializeError).toHaveBeenCalledWith('foobar');
        });
    });

    describe('#getApplyCouponError()', () => {
        it('returns error if there is an error when updating the a coupon', () => {
            jest.spyOn(selectors.coupons, 'getApplyError').mockReturnValue(errorResponse);

            expect(errors.getApplyCouponError()).toEqual(errorResponse);
            expect(selectors.coupons.getApplyError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when updating the a coupon', () => {
            jest.spyOn(selectors.coupons, 'getApplyError').mockReturnValue();

            expect(errors.getApplyCouponError()).toEqual(undefined);
            expect(selectors.coupons.getApplyError).toHaveBeenCalled();
        });
    });

    describe('#getRemoveCouponError()', () => {
        it('returns error if there is an error when updating the a coupon', () => {
            jest.spyOn(selectors.coupons, 'getRemoveError').mockReturnValue(errorResponse);

            expect(errors.getRemoveCouponError()).toEqual(errorResponse);
            expect(selectors.coupons.getRemoveError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when updating the a coupon', () => {
            jest.spyOn(selectors.coupons, 'getRemoveError').mockReturnValue();

            expect(errors.getRemoveCouponError()).toEqual(undefined);
            expect(selectors.coupons.getRemoveError).toHaveBeenCalled();
        });
    });

    describe('#getLoadInstrumentsError()', () => {
        it('returns error if there is an error when loading instruments', () => {
            jest.spyOn(selectors.instruments, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadInstrumentsError()).toEqual(errorResponse);
            expect(selectors.instruments.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when loading instruments', () => {
            jest.spyOn(selectors.instruments, 'getLoadError').mockReturnValue();

            expect(errors.getLoadInstrumentsError()).toEqual(undefined);
            expect(selectors.instruments.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getDeleteInstrumentError()', () => {
        it('returns error if there is an error when deleting instruments', () => {
            jest.spyOn(selectors.instruments, 'getDeleteError').mockReturnValue(errorResponse);

            expect(errors.getDeleteInstrumentError('123')).toEqual(errorResponse);
            expect(selectors.instruments.getDeleteError).toHaveBeenCalledWith('123');
        });

        it('returns undefined if there is NO error when deleting instruments', () => {
            jest.spyOn(selectors.instruments, 'getDeleteError').mockReturnValue();

            expect(errors.getDeleteInstrumentError('123')).toEqual(undefined);
            expect(selectors.instruments.getDeleteError).toHaveBeenCalledWith('123');
        });
    });

    describe('#getLoadConfigError()', () => {
        it('returns error if there is an error when loading config', () => {
            jest.spyOn(selectors.config, 'getLoadError').mockReturnValue(errorResponse);

            expect(errors.getLoadConfigError()).toEqual(errorResponse);
            expect(selectors.config.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when loading config', () => {
            jest.spyOn(selectors.config, 'getLoadError').mockReturnValue();

            expect(errors.getLoadConfigError()).toEqual(undefined);
            expect(selectors.config.getLoadError).toHaveBeenCalled();
        });
    });
});
