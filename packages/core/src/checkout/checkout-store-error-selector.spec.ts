import { Response } from '@bigcommerce/request-sender';

import { ErrorResponseBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getErrorResponse } from '../common/http-request/responses.mock';

import {
    CheckoutStoreErrorSelectorFactory,
    createCheckoutStoreErrorSelectorFactory,
} from './checkout-store-error-selector';
import { getCheckoutStoreStateWithOrder } from './checkouts.mock';
import createInternalCheckoutSelectors from './create-internal-checkout-selectors';
import InternalCheckoutSelectors from './internal-checkout-selectors';

describe('CheckoutStoreErrorSelector', () => {
    let createCheckoutStoreErrorSelector: CheckoutStoreErrorSelectorFactory;
    let errorResponse: Response<ErrorResponseBody>;
    let selectors: InternalCheckoutSelectors;

    beforeEach(() => {
        createCheckoutStoreErrorSelector = createCheckoutStoreErrorSelectorFactory();
        selectors = createInternalCheckoutSelectors(getCheckoutStoreStateWithOrder());

        errorResponse = getErrorResponse();
    });

    describe('#getError()', () => {
        it('returns no error if there are no errors', () => {
            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getError()).toBeUndefined();
        });

        it('returns the first error that it encounters', () => {
            jest.spyOn(selectors.checkout, 'getLoadError').mockReturnValue(undefined);
            jest.spyOn(selectors.paymentStrategies, 'getExecuteError').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                errorResponse,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getError()).toEqual(errorResponse);

            expect(selectors.checkout.getLoadError).toHaveBeenCalled();
            expect(selectors.paymentStrategies.getExecuteError).toHaveBeenCalled();
        });
    });

    describe('#getLoadCheckoutError()', () => {
        it('returns error if there is an error when loading checkout', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.checkout, 'getLoadError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadCheckoutError()).toEqual(errorResponse);
            expect(selectors.checkout.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading checkout', () => {
            jest.spyOn(selectors.checkout, 'getLoadError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadCheckoutError()).toBeUndefined();
            expect(selectors.checkout.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getCreateCustomerAccountError()', () => {
        it('returns error if there is an error when loading checkout', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.customer, 'getCreateAccountError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getCreateCustomerAccountError()).toEqual(errorResponse);
            expect(selectors.customer.getCreateAccountError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading checkout', () => {
            jest.spyOn(selectors.customer, 'getCreateAccountError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getCreateCustomerAccountError()).toBeUndefined();
            expect(selectors.customer.getCreateAccountError).toHaveBeenCalled();
        });
    });

    describe('#getSignInEmailError()', () => {
        it('returns error if theres one', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.signInEmail, 'getSendError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getSignInEmailError()).toEqual(errorResponse);
            expect(selectors.signInEmail.getSendError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error', () => {
            jest.spyOn(selectors.signInEmail, 'getSendError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getSignInEmailError()).toBeUndefined();
            expect(selectors.signInEmail.getSendError).toHaveBeenCalled();
        });
    });

    describe('#getUpdateCheckoutError()', () => {
        it('returns error if there is an error when loading checkout', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.checkout, 'getUpdateError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getUpdateCheckoutError()).toEqual(errorResponse);
            expect(selectors.checkout.getUpdateError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading checkout', () => {
            jest.spyOn(selectors.checkout, 'getUpdateError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getUpdateCheckoutError()).toBeUndefined();
            expect(selectors.checkout.getUpdateError).toHaveBeenCalled();
        });
    });

    describe('#getSubmitOrderError()', () => {
        it('returns error if there is an error when submitting order', () => {
            jest.spyOn(selectors.paymentStrategies, 'getExecuteError').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                errorResponse,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getSubmitOrderError()).toEqual(errorResponse);
            expect(selectors.paymentStrategies.getExecuteError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when submitting order', () => {
            jest.spyOn(selectors.paymentStrategies, 'getExecuteError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getSubmitOrderError()).toBeUndefined();
            expect(selectors.paymentStrategies.getExecuteError).toHaveBeenCalled();
        });
    });

    describe('#getFinalizeOrderError()', () => {
        it('returns error if there is an error when finalizing order', () => {
            jest.spyOn(selectors.paymentStrategies, 'getFinalizeError').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                errorResponse,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getFinalizeOrderError()).toEqual(errorResponse);
            expect(selectors.paymentStrategies.getFinalizeError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when finalizing order', () => {
            jest.spyOn(selectors.paymentStrategies, 'getFinalizeError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getFinalizeOrderError()).toBeUndefined();
            expect(selectors.paymentStrategies.getFinalizeError).toHaveBeenCalled();
        });
    });

    describe('#getLoadOrderError()', () => {
        it('returns error if there is an error when loading order', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.order, 'getLoadError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadOrderError()).toEqual(errorResponse);
            expect(selectors.order.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading order', () => {
            jest.spyOn(selectors.order, 'getLoadError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadOrderError()).toBeUndefined();
            expect(selectors.order.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getLoadCartError()', () => {
        it('returns error if there is an error when loading cart', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.cart, 'getLoadError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadCartError()).toEqual(errorResponse);
            expect(selectors.cart.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading cart', () => {
            jest.spyOn(selectors.cart, 'getLoadError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadCartError()).toBeUndefined();
            expect(selectors.cart.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getLoadBillingCountriesError()', () => {
        it('returns error if there is an error when loading billing countries', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.countries, 'getLoadError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadBillingCountriesError()).toEqual(errorResponse);
            expect(selectors.countries.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading billing countries', () => {
            jest.spyOn(selectors.countries, 'getLoadError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadBillingCountriesError()).toBeUndefined();
            expect(selectors.countries.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getLoadShippingCountriesError()', () => {
        it('returns error if there is an error when loading shipping countries', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.shippingCountries, 'getLoadError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadShippingCountriesError()).toEqual(errorResponse);
            expect(selectors.shippingCountries.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading shipping countries', () => {
            jest.spyOn(selectors.shippingCountries, 'getLoadError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadShippingCountriesError()).toBeUndefined();
            expect(selectors.shippingCountries.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getLoadPaymentMethodsError()', () => {
        it('returns error if there is an error when loading payment methods', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.paymentMethods, 'getLoadError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadPaymentMethodsError()).toEqual(errorResponse);
            expect(selectors.paymentMethods.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading payment methods', () => {
            jest.spyOn(selectors.paymentMethods, 'getLoadError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadPaymentMethodsError()).toBeUndefined();
            expect(selectors.paymentMethods.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getLoadPaymentMethodError()', () => {
        it('returns error if there is an error when loading payment method', () => {
            jest.spyOn(selectors.paymentMethods, 'getLoadMethodError').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                errorResponse,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadPaymentMethodError('braintree')).toEqual(errorResponse);
            expect(selectors.paymentMethods.getLoadMethodError).toHaveBeenCalledWith('braintree');
        });

        it('returns undefined if there is no error when loading payment method', () => {
            jest.spyOn(selectors.paymentMethods, 'getLoadMethodError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadPaymentMethodError('braintree')).toBeUndefined();
            expect(selectors.paymentMethods.getLoadMethodError).toHaveBeenCalledWith('braintree');
        });
    });

    describe('#getInitializePaymentError()', () => {
        it('returns error if unable to initialize payment', () => {
            jest.spyOn(selectors.paymentStrategies, 'getInitializeError').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                errorResponse,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getInitializePaymentError('braintree')).toEqual(errorResponse);
            expect(selectors.paymentStrategies.getInitializeError).toHaveBeenCalledWith(
                'braintree',
            );
        });

        it('returns undefined if able to initialize payment', () => {
            jest.spyOn(selectors.paymentStrategies, 'getInitializeError').mockReturnValue(
                undefined,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getInitializePaymentError('braintree')).toBeUndefined();
            expect(selectors.paymentStrategies.getInitializeError).toHaveBeenCalledWith(
                'braintree',
            );
        });
    });

    describe('#getSignInError()', () => {
        it('returns error if there is an error when signing in', () => {
            jest.spyOn(selectors.customerStrategies, 'getSignInError').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                errorResponse,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getSignInError()).toEqual(errorResponse);
            expect(selectors.customerStrategies.getSignInError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when signing in', () => {
            jest.spyOn(selectors.customerStrategies, 'getSignInError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getSignInError()).toBeUndefined();
            expect(selectors.customerStrategies.getSignInError).toHaveBeenCalled();
        });
    });

    describe('#getSignOutError()', () => {
        it('returns error if there is an error when signing out', () => {
            jest.spyOn(selectors.customerStrategies, 'getSignOutError').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                errorResponse,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getSignOutError()).toEqual(errorResponse);
            expect(selectors.customerStrategies.getSignOutError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when signing out', () => {
            jest.spyOn(selectors.customerStrategies, 'getSignOutError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getSignOutError()).toBeUndefined();
            expect(selectors.customerStrategies.getSignOutError).toHaveBeenCalled();
        });
    });

    describe('#getInitializeCustomerError()', () => {
        it('returns error if unable to initialize customer', () => {
            jest.spyOn(selectors.customerStrategies, 'getInitializeError').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                errorResponse,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getInitializeCustomerError()).toEqual(errorResponse);
            expect(selectors.customerStrategies.getInitializeError).toHaveBeenCalled();
        });

        it('returns undefined if able to initialize customer', () => {
            jest.spyOn(selectors.customerStrategies, 'getInitializeError').mockReturnValue(
                undefined,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getInitializeCustomerError()).toBeUndefined();
            expect(selectors.customerStrategies.getInitializeError).toHaveBeenCalled();
        });
    });

    describe('#getLoadShippingOptionsError()', () => {
        it('returns error if there is an error when loading the shipping options', () => {
            jest.spyOn(selectors.consignments, 'getLoadShippingOptionsError').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                errorResponse,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadShippingOptionsError()).toEqual(errorResponse);
            expect(selectors.consignments.getLoadShippingOptionsError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when loading the shipping options', () => {
            jest.spyOn(selectors.consignments, 'getLoadShippingOptionsError').mockReturnValue(
                undefined,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadShippingOptionsError()).toBeUndefined();
            expect(selectors.consignments.getLoadShippingOptionsError).toHaveBeenCalled();
        });
    });

    describe('#getSelectShippingOptionError()', () => {
        it('returns error if there is an error when selecting the shipping options', () => {
            jest.spyOn(selectors.shippingStrategies, 'getSelectOptionError').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                errorResponse,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getSelectShippingOptionError()).toEqual(errorResponse);
            expect(selectors.shippingStrategies.getSelectOptionError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when selecting the shipping options', () => {
            jest.spyOn(selectors.shippingStrategies, 'getSelectOptionError').mockReturnValue(
                undefined,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getSelectShippingOptionError()).toBeUndefined();
            expect(selectors.shippingStrategies.getSelectOptionError).toHaveBeenCalled();
        });
    });

    describe('#getUpdateBillingAddressError()', () => {
        it('returns error if there is an error when updating the billing address', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.billingAddress, 'getUpdateError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getUpdateBillingAddressError()).toEqual(errorResponse);
            expect(selectors.billingAddress.getUpdateError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when updating the billing address', () => {
            jest.spyOn(selectors.billingAddress, 'getUpdateError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getUpdateBillingAddressError()).toBeUndefined();
            expect(selectors.billingAddress.getUpdateError).toHaveBeenCalled();
        });
    });

    describe('#getUpdateSubscriptionsError()', () => {
        it('returns error if there is an error when updating subscriptions', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.subscriptions, 'getUpdateError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getUpdateSubscriptionsError()).toEqual(errorResponse);
            expect(selectors.subscriptions.getUpdateError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when updating subscriptions', () => {
            jest.spyOn(selectors.subscriptions, 'getUpdateError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getUpdateSubscriptionsError()).toBeUndefined();
            expect(selectors.subscriptions.getUpdateError).toHaveBeenCalled();
        });
    });

    describe('#getContinueAsGuestError()', () => {
        it('returns error if there is an error', () => {
            jest.spyOn(selectors.billingAddress, 'getContinueAsGuestError').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                errorResponse,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getContinueAsGuestError()).toEqual(errorResponse);
            expect(selectors.billingAddress.getContinueAsGuestError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO errors', () => {
            jest.spyOn(selectors.billingAddress, 'getContinueAsGuestError').mockReturnValue(
                undefined,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getContinueAsGuestError()).toBeUndefined();
            expect(selectors.billingAddress.getContinueAsGuestError).toHaveBeenCalled();
        });
    });

    describe('#getUpdateConsignmentError()', () => {
        it('returns error if there is an error when updating consignments', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.consignments, 'getUpdateError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getUpdateConsignmentError('foo')).toEqual(errorResponse);
            expect(selectors.consignments.getUpdateError).toHaveBeenCalledWith('foo');
        });

        it('returns undefined if there is NO error when updating consignments', () => {
            jest.spyOn(selectors.consignments, 'getUpdateError');

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getUpdateConsignmentError('foo')).toBeUndefined();
            expect(selectors.consignments.getUpdateError).toHaveBeenCalledWith('foo');
        });
    });

    describe('#getDeleteConsignmentError()', () => {
        it('returns error if there is an error when deleting consignments', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.consignments, 'getDeleteError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getDeleteConsignmentError('foo')).toEqual(errorResponse);
            expect(selectors.consignments.getDeleteError).toHaveBeenCalledWith('foo');
        });

        it('returns undefined if there is NO error when deleting consignments', () => {
            jest.spyOn(selectors.consignments, 'getDeleteError');

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getDeleteConsignmentError('foo')).toBeUndefined();
            expect(selectors.consignments.getDeleteError).toHaveBeenCalledWith('foo');
        });
    });

    describe('#getCreateConsignmentsError()', () => {
        it('returns error if there is an error when creating consignments', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.consignments, 'getCreateError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getCreateConsignmentsError()).toEqual(errorResponse);
            expect(selectors.consignments.getCreateError).toHaveBeenCalledWith();
        });

        it('returns undefined if there is NO error when creating consignments', () => {
            jest.spyOn(selectors.consignments, 'getCreateError');

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getCreateConsignmentsError()).toBeUndefined();
            expect(selectors.consignments.getCreateError).toHaveBeenCalledWith();
        });
    });

    describe('#getUpdateShippingAddressError()', () => {
        it('returns error if there is an error when updating the shipping address', () => {
            jest.spyOn(selectors.shippingStrategies, 'getUpdateAddressError').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                errorResponse,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getUpdateShippingAddressError()).toEqual(errorResponse);
            expect(selectors.shippingStrategies.getUpdateAddressError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when updating the shipping address', () => {
            jest.spyOn(selectors.shippingStrategies, 'getUpdateAddressError').mockReturnValue(
                undefined,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getUpdateShippingAddressError()).toBeUndefined();
            expect(selectors.shippingStrategies.getUpdateAddressError).toHaveBeenCalled();
        });
    });

    describe('#getInitializePaymentError()', () => {
        it('returns error if unable to initialize shipping', () => {
            jest.spyOn(selectors.shippingStrategies, 'getInitializeError').mockReturnValue(
                // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                errorResponse,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getInitializeShippingError('foobar')).toEqual(errorResponse);
            expect(selectors.shippingStrategies.getInitializeError).toHaveBeenCalledWith('foobar');
        });

        it('returns undefined if able to initialize shipping', () => {
            jest.spyOn(selectors.shippingStrategies, 'getInitializeError').mockReturnValue(
                undefined,
            );

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getInitializeShippingError('foobar')).toBeUndefined();
            expect(selectors.shippingStrategies.getInitializeError).toHaveBeenCalledWith('foobar');
        });
    });

    describe('#getApplyCouponError()', () => {
        it('returns error if there is an error when updating the a coupon', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.coupons, 'getApplyError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getApplyCouponError()).toEqual(errorResponse);
            expect(selectors.coupons.getApplyError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when updating the a coupon', () => {
            jest.spyOn(selectors.coupons, 'getApplyError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getApplyCouponError()).toBeUndefined();
            expect(selectors.coupons.getApplyError).toHaveBeenCalled();
        });
    });

    describe('#getRemoveCouponError()', () => {
        it('returns error if there is an error when updating the a coupon', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.coupons, 'getRemoveError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getRemoveCouponError()).toEqual(errorResponse);
            expect(selectors.coupons.getRemoveError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when updating the a coupon', () => {
            jest.spyOn(selectors.coupons, 'getRemoveError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getRemoveCouponError()).toBeUndefined();
            expect(selectors.coupons.getRemoveError).toHaveBeenCalled();
        });
    });

    describe('#getApplyGiftCertificateError()', () => {
        it('returns error if there is an error when applying gift certificate', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.giftCertificates, 'getApplyError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getApplyGiftCertificateError()).toEqual(errorResponse);
            expect(selectors.giftCertificates.getApplyError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when applying gift certificate', () => {
            jest.spyOn(selectors.giftCertificates, 'getApplyError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getApplyGiftCertificateError()).toBeUndefined();
            expect(selectors.giftCertificates.getApplyError).toHaveBeenCalled();
        });
    });

    describe('#getRemoveGiftCertificateError()', () => {
        it('returns error if there is an error when removing gift certificate', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.giftCertificates, 'getRemoveError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getRemoveGiftCertificateError()).toEqual(errorResponse);
            expect(selectors.giftCertificates.getRemoveError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when removing gift certificate', () => {
            jest.spyOn(selectors.giftCertificates, 'getRemoveError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getRemoveGiftCertificateError()).toBeUndefined();
            expect(selectors.giftCertificates.getRemoveError).toHaveBeenCalled();
        });
    });

    describe('#getLoadInstrumentsError()', () => {
        it('returns error if there is an error when loading instruments', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.instruments, 'getLoadError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadInstrumentsError()).toEqual(errorResponse);
            expect(selectors.instruments.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when loading instruments', () => {
            jest.spyOn(selectors.instruments, 'getLoadError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadInstrumentsError()).toBeUndefined();
            expect(selectors.instruments.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getDeleteInstrumentError()', () => {
        it('returns error if there is an error when deleting instruments', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.instruments, 'getDeleteError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getDeleteInstrumentError('123')).toEqual(errorResponse);
            expect(selectors.instruments.getDeleteError).toHaveBeenCalledWith('123');
        });

        it('returns undefined if there is NO error when deleting instruments', () => {
            jest.spyOn(selectors.instruments, 'getDeleteError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getDeleteInstrumentError('123')).toBeUndefined();
            expect(selectors.instruments.getDeleteError).toHaveBeenCalledWith('123');
        });
    });

    describe('#getLoadConfigError()', () => {
        it('returns error if there is an error when loading config', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.config, 'getLoadError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadConfigError()).toEqual(errorResponse);
            expect(selectors.config.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is NO error when loading config', () => {
            jest.spyOn(selectors.config, 'getLoadError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadConfigError()).toBeUndefined();
            expect(selectors.config.getLoadError).toHaveBeenCalled();
        });
    });

    describe('#getLoadExtensionsError()', () => {
        it('returns error if there is an error when loading extensions', () => {
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            jest.spyOn(selectors.extensions, 'getLoadError').mockReturnValue(errorResponse);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadExtensionsError()).toEqual(errorResponse);
            expect(selectors.extensions.getLoadError).toHaveBeenCalled();
        });

        it('returns undefined if there is no error when loading extensions', () => {
            jest.spyOn(selectors.extensions, 'getLoadError').mockReturnValue(undefined);

            const errors = createCheckoutStoreErrorSelector(selectors);

            expect(errors.getLoadExtensionsError()).toBeUndefined();
            expect(selectors.extensions.getLoadError).toHaveBeenCalled();
        });
    });
});
