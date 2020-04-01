import { createCheckoutStoreStatusSelectorFactory, CheckoutStoreStatusSelectorFactory } from './checkout-store-status-selector';
import { getCheckoutStoreState } from './checkouts.mock';
import createInternalCheckoutSelectors from './create-internal-checkout-selectors';
import InternalCheckoutSelectors from './internal-checkout-selectors';

describe('CheckoutStoreStatusSelector', () => {
    let createCheckoutStoreStatusSelector: CheckoutStoreStatusSelectorFactory;
    let selectors: InternalCheckoutSelectors;

    beforeEach(() => {
        createCheckoutStoreStatusSelector = createCheckoutStoreStatusSelectorFactory();
        selectors = createInternalCheckoutSelectors(getCheckoutStoreState());
    });

    describe('#isLoadingCheckout()', () => {
        it('returns true if loading checkout', () => {
            jest.spyOn(selectors.checkout, 'isLoading').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingCheckout()).toEqual(true);
            expect(selectors.checkout.isLoading).toHaveBeenCalled();
        });

        it('returns false if not loading checkout', () => {
            jest.spyOn(selectors.checkout, 'isLoading').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingCheckout()).toEqual(false);
            expect(selectors.checkout.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isUpdatingCheckout()', () => {
        it('returns true if updating checkout', () => {
            jest.spyOn(selectors.checkout, 'isUpdating').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isUpdatingCheckout()).toEqual(true);
            expect(selectors.checkout.isUpdating).toHaveBeenCalled();
        });

        it('returns false if not updating checkout', () => {
            jest.spyOn(selectors.checkout, 'isUpdating').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isUpdatingCheckout()).toEqual(false);
            expect(selectors.checkout.isUpdating).toHaveBeenCalled();
        });
    });

    describe('#isExecutingSpamCheck()', () => {
        it('returns true if executing spam check', () => {
            jest.spyOn(selectors.checkout, 'isExecutingSpamCheck').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isExecutingSpamCheck()).toEqual(true);
            expect(selectors.checkout.isExecutingSpamCheck).toHaveBeenCalled();
        });

        it('returns false if not updating checkout', () => {
            jest.spyOn(selectors.checkout, 'isExecutingSpamCheck').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isExecutingSpamCheck()).toEqual(false);
            expect(selectors.checkout.isExecutingSpamCheck).toHaveBeenCalled();
        });
    });

    describe('#isSubmittingOrder()', () => {
        it('returns true if submitting order', () => {
            jest.spyOn(selectors.paymentStrategies, 'isExecuting').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isSubmittingOrder()).toEqual(true);
            expect(selectors.paymentStrategies.isExecuting).toHaveBeenCalled();
        });

        it('returns false if not submitting order', () => {
            jest.spyOn(selectors.paymentStrategies, 'isExecuting').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isSubmittingOrder()).toEqual(false);
            expect(selectors.paymentStrategies.isExecuting).toHaveBeenCalled();
        });

        it('returns true if executing spam check', () => {
            jest.spyOn(selectors.checkout, 'isExecutingSpamCheck').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isSubmittingOrder()).toEqual(true);
            expect(selectors.checkout.isExecutingSpamCheck).toHaveBeenCalled();
        });

        it('returns false if not executing spam check', () => {
            jest.spyOn(selectors.checkout, 'isExecutingSpamCheck').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isSubmittingOrder()).toEqual(false);
            expect(selectors.checkout.isExecutingSpamCheck).toHaveBeenCalled();
        });
    });

    describe('#isFinalizingOrder()', () => {
        it('returns true if finalizing order', () => {
            jest.spyOn(selectors.paymentStrategies, 'isFinalizing').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isFinalizingOrder()).toEqual(true);
            expect(selectors.paymentStrategies.isFinalizing).toHaveBeenCalled();
        });

        it('returns false if not finalizing order', () => {
            jest.spyOn(selectors.paymentStrategies, 'isFinalizing').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isFinalizingOrder()).toEqual(false);
            expect(selectors.paymentStrategies.isFinalizing).toHaveBeenCalled();
        });
    });

    describe('#isLoadingOrder()', () => {
        it('returns true if loading order', () => {
            jest.spyOn(selectors.order, 'isLoading').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingOrder()).toEqual(true);
            expect(selectors.order.isLoading).toHaveBeenCalled();
        });

        it('returns false if not loading order', () => {
            jest.spyOn(selectors.order, 'isLoading').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingOrder()).toEqual(false);
            expect(selectors.order.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isLoadingCart()', () => {
        it('returns true if loading cart', () => {
            jest.spyOn(selectors.cart, 'isLoading').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingCart()).toEqual(true);
            expect(selectors.cart.isLoading).toHaveBeenCalled();
        });

        it('returns false if not loading cart', () => {
            jest.spyOn(selectors.cart, 'isLoading').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingCart()).toEqual(false);
            expect(selectors.cart.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isLoadingBillingCountries()', () => {
        it('returns true if loading billing countries', () => {
            jest.spyOn(selectors.countries, 'isLoading').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingBillingCountries()).toEqual(true);
            expect(selectors.countries.isLoading).toHaveBeenCalled();
        });

        it('returns false if not loading billing countries', () => {
            jest.spyOn(selectors.countries, 'isLoading').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingBillingCountries()).toEqual(false);
            expect(selectors.countries.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isLoadingShippingCountries()', () => {
        it('returns true if loading shipping countries', () => {
            jest.spyOn(selectors.shippingCountries, 'isLoading').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingShippingCountries()).toEqual(true);
            expect(selectors.shippingCountries.isLoading).toHaveBeenCalled();
        });

        it('returns false if not loading shipping countries', () => {
            jest.spyOn(selectors.shippingCountries, 'isLoading').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingShippingCountries()).toEqual(false);
            expect(selectors.shippingCountries.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isLoadingPaymentMethods()', () => {
        it('returns true if loading payment methods', () => {
            jest.spyOn(selectors.paymentMethods, 'isLoading').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingPaymentMethods()).toEqual(true);
            expect(selectors.paymentMethods.isLoading).toHaveBeenCalled();
        });

        it('returns false if not loading payment methods', () => {
            jest.spyOn(selectors.paymentMethods, 'isLoading').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingPaymentMethods()).toEqual(false);
            expect(selectors.paymentMethods.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isLoadingPaymentMethod()', () => {
        it('returns true if loading payment method', () => {
            jest.spyOn(selectors.paymentMethods, 'isLoadingMethod').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingPaymentMethod('braintree')).toEqual(true);
            expect(selectors.paymentMethods.isLoadingMethod).toHaveBeenCalledWith('braintree');
        });

        it('returns false if not loading payment methods', () => {
            jest.spyOn(selectors.paymentMethods, 'isLoadingMethod').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingPaymentMethod('braintree')).toEqual(false);
            expect(selectors.paymentMethods.isLoadingMethod).toHaveBeenCalledWith('braintree');
        });
    });

    describe('#isInitializingPayment()', () => {
        beforeEach(() => {
            jest.spyOn(selectors.paymentStrategies, 'isInitializing').mockReturnValue(false);
        });

        it('returns true if initializing payment', () => {
            jest.spyOn(selectors.paymentStrategies, 'isInitializing').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isInitializingPayment('foobar')).toEqual(true);
            expect(selectors.paymentStrategies.isInitializing).toHaveBeenCalledWith('foobar');
        });

        it('returns false if not initializing payment', () => {
            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isInitializingPayment('foobar')).toEqual(false);
            expect(selectors.paymentStrategies.isInitializing).toHaveBeenCalledWith('foobar');
        });
    });

    describe('#isSigningIn()', () => {
        it('returns true if signing in', () => {
            jest.spyOn(selectors.customerStrategies, 'isSigningIn').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isSigningIn()).toEqual(true);
            expect(selectors.customerStrategies.isSigningIn).toHaveBeenCalled();
        });

        it('returns false if not signing in', () => {
            jest.spyOn(selectors.customerStrategies, 'isSigningIn').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isSigningIn()).toEqual(false);
            expect(selectors.customerStrategies.isSigningIn).toHaveBeenCalled();
        });
    });

    describe('#isSigningOut()', () => {
        beforeEach(() => {
            jest.spyOn(selectors.customerStrategies, 'isSigningOut').mockReturnValue(false);
        });

        it('returns true if signing out', () => {
            jest.spyOn(selectors.customerStrategies, 'isSigningOut').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isSigningOut()).toEqual(true);
            expect(selectors.customerStrategies.isSigningOut).toHaveBeenCalled();
        });

        it('returns false if not signing out', () => {
            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isSigningOut()).toEqual(false);
            expect(selectors.customerStrategies.isSigningOut).toHaveBeenCalled();
        });
    });

    describe('#isInitializingCustomer()', () => {
        it('returns true if initializing', () => {
            jest.spyOn(selectors.customerStrategies, 'isInitializing').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isInitializingCustomer('foobar')).toEqual(true);
            expect(selectors.customerStrategies.isInitializing).toHaveBeenCalledWith('foobar');
        });

        it('returns false if not initializing', () => {
            jest.spyOn(selectors.customerStrategies, 'isInitializing').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isInitializingCustomer('foobar')).toEqual(false);
            expect(selectors.customerStrategies.isInitializing).toHaveBeenCalledWith('foobar');
        });
    });

    describe('#isLoadingShippingOptions()', () => {
        it('returns true if loading shipping options', () => {
            jest.spyOn(selectors.consignments, 'isLoadingShippingOptions').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingShippingOptions()).toEqual(true);
            expect(selectors.consignments.isLoadingShippingOptions).toHaveBeenCalled();
        });

        it('returns false if not loading shipping options', () => {
            jest.spyOn(selectors.consignments, 'isLoadingShippingOptions').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingShippingOptions()).toEqual(false);
            expect(selectors.consignments.isLoadingShippingOptions).toHaveBeenCalled();
        });
    });

    describe('#isSelectingShippingOption()', () => {
        it('returns true if selecting shipping options', () => {
            jest.spyOn(selectors.shippingStrategies, 'isSelectingOption').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isSelectingShippingOption()).toEqual(true);
            expect(selectors.shippingStrategies.isSelectingOption).toHaveBeenCalled();
        });

        it('returns false if not selecting shipping options', () => {
            jest.spyOn(selectors.shippingStrategies, 'isSelectingOption').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isSelectingShippingOption()).toEqual(false);
            expect(selectors.shippingStrategies.isSelectingOption).toHaveBeenCalled();
        });
    });

    describe('#isUpdatingBillingAddress()', () => {
        it('returns true if updating billing address', () => {
            jest.spyOn(selectors.billingAddress, 'isUpdating').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isUpdatingBillingAddress()).toEqual(true);
            expect(selectors.billingAddress.isUpdating).toHaveBeenCalled();
        });

        it('returns false if not updating billing address', () => {
            jest.spyOn(selectors.billingAddress, 'isUpdating').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isUpdatingBillingAddress()).toEqual(false);
            expect(selectors.billingAddress.isUpdating).toHaveBeenCalled();
        });
    });

    describe('#isUpdatingSubscriptions()', () => {
        it('returns true if updating subscriptions', () => {
            jest.spyOn(selectors.subscriptions, 'isUpdating').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isUpdatingSubscriptions()).toEqual(true);
            expect(selectors.subscriptions.isUpdating).toHaveBeenCalled();
        });

        it('returns false if not updating subscriptions', () => {
            jest.spyOn(selectors.subscriptions, 'isUpdating').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isUpdatingSubscriptions()).toEqual(false);
            expect(selectors.subscriptions.isUpdating).toHaveBeenCalled();
        });
    });

    describe('#isContinuingAsGuest()', () => {
        it('returns true if continuing as guest', () => {
            jest.spyOn(selectors.billingAddress, 'isContinuingAsGuest').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isContinuingAsGuest()).toEqual(true);
            expect(selectors.billingAddress.isContinuingAsGuest).toHaveBeenCalled();
        });

        it('returns false if not continuing as guest', () => {
            jest.spyOn(selectors.billingAddress, 'isContinuingAsGuest').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isContinuingAsGuest()).toEqual(false);
            expect(selectors.billingAddress.isContinuingAsGuest).toHaveBeenCalled();
        });
    });

    describe('#isUpdatingShippingAddress()', () => {
        it('returns true if updating shipping address', () => {
            jest.spyOn(selectors.shippingStrategies, 'isUpdatingAddress').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isUpdatingShippingAddress()).toEqual(true);
            expect(selectors.shippingStrategies.isUpdatingAddress).toHaveBeenCalled();
        });

        it('returns false if not updating shipping address', () => {
            jest.spyOn(selectors.shippingStrategies, 'isUpdatingAddress').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isUpdatingShippingAddress()).toEqual(false);
            expect(selectors.shippingStrategies.isUpdatingAddress).toHaveBeenCalled();
        });
    });

    describe('#isUpdatingConsignment()', () => {
        it('returns true if updating shipping address', () => {
            jest.spyOn(selectors.consignments, 'isUpdating').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isUpdatingConsignment()).toEqual(true);
            expect(selectors.consignments.isUpdating).toHaveBeenCalled();
        });

        it('returns false if not updating shipping address', () => {
            jest.spyOn(selectors.consignments, 'isUpdating').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isUpdatingConsignment()).toEqual(false);
            expect(selectors.consignments.isUpdating).toHaveBeenCalled();
        });
    });

    describe('#isDeletingConsignment()', () => {
        it('returns true if deleting consignment', () => {
            jest.spyOn(selectors.consignments, 'isDeleting').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isDeletingConsignment()).toEqual(true);
            expect(selectors.consignments.isDeleting).toHaveBeenCalled();
        });

        it('returns false if not deleting consignment', () => {
            jest.spyOn(selectors.consignments, 'isDeleting').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isDeletingConsignment()).toEqual(false);
            expect(selectors.consignments.isDeleting).toHaveBeenCalled();
        });
    });

    describe('#isCreatingConsignments()', () => {
        it('returns true if updating shipping address', () => {
            jest.spyOn(selectors.consignments, 'isCreating').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isCreatingConsignments()).toEqual(true);
            expect(selectors.consignments.isCreating).toHaveBeenCalled();
        });

        it('returns false if not updating shipping address', () => {
            jest.spyOn(selectors.consignments, 'isCreating').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isCreatingConsignments()).toEqual(false);
            expect(selectors.consignments.isCreating).toHaveBeenCalled();
        });
    });

    describe('#isInitializingShipping()', () => {
        it('returns true if initializing shipping', () => {
            jest.spyOn(selectors.shippingStrategies, 'isInitializing').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isInitializingShipping('foobar')).toEqual(true);
            expect(selectors.shippingStrategies.isInitializing).toHaveBeenCalledWith('foobar');
        });

        it('returns false if not initializing shipping', () => {
            jest.spyOn(selectors.shippingStrategies, 'isInitializing').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isInitializingShipping('foobar')).toEqual(false);
            expect(selectors.shippingStrategies.isInitializing).toHaveBeenCalledWith('foobar');
        });
    });

    describe('#isApplyingCoupon()', () => {
        it('returns true if applying a coupon', () => {
            jest.spyOn(selectors.coupons, 'isApplying').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isApplyingCoupon()).toEqual(true);
            expect(selectors.coupons.isApplying).toHaveBeenCalled();
        });

        it('returns false if not applying a coupon', () => {
            jest.spyOn(selectors.coupons, 'isApplying').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isApplyingCoupon()).toEqual(false);
            expect(selectors.coupons.isApplying).toHaveBeenCalled();
        });
    });

    describe('#isRemovingCoupon()', () => {
        it('returns true if removing a coupon', () => {
            jest.spyOn(selectors.coupons, 'isRemoving').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isRemovingCoupon()).toEqual(true);
            expect(selectors.coupons.isRemoving).toHaveBeenCalled();
        });

        it('returns false if not removing a coupon', () => {
            jest.spyOn(selectors.coupons, 'isRemoving').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isRemovingCoupon()).toEqual(false);
            expect(selectors.coupons.isRemoving).toHaveBeenCalled();
        });
    });

    describe('#isApplyingGiftCertificate()', () => {
        it('returns true if applying a gift certificate', () => {
            jest.spyOn(selectors.giftCertificates, 'isApplying').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isApplyingGiftCertificate()).toEqual(true);
            expect(selectors.giftCertificates.isApplying).toHaveBeenCalled();
        });

        it('returns false if not applying a gift certificate', () => {
            jest.spyOn(selectors.giftCertificates, 'isApplying').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isApplyingGiftCertificate()).toEqual(false);
            expect(selectors.giftCertificates.isApplying).toHaveBeenCalled();
        });
    });

    describe('#isRemovingGiftCertificate()', () => {
        it('returns true if removing a gift certificate', () => {
            jest.spyOn(selectors.giftCertificates, 'isRemoving').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isRemovingGiftCertificate()).toEqual(true);
            expect(selectors.giftCertificates.isRemoving).toHaveBeenCalled();
        });

        it('returns false if not removing a gift certificate', () => {
            jest.spyOn(selectors.giftCertificates, 'isRemoving').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isRemovingGiftCertificate()).toEqual(false);
            expect(selectors.giftCertificates.isRemoving).toHaveBeenCalled();
        });
    });

    describe('#isLoadingInstruments()', () => {
        it('returns true if loading instruments', () => {
            jest.spyOn(selectors.instruments, 'isLoading').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingInstruments()).toEqual(true);
            expect(selectors.instruments.isLoading).toHaveBeenCalled();
        });

        it('returns false if not loading instruments', () => {
            jest.spyOn(selectors.instruments, 'isLoading').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingInstruments()).toEqual(false);
            expect(selectors.instruments.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isDeletingInstrument()', () => {
        it('returns true if deleting instrument', () => {
            jest.spyOn(selectors.instruments, 'isDeleting').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isDeletingInstrument('123')).toEqual(true);
            expect(selectors.instruments.isDeleting).toHaveBeenCalledWith('123');
        });

        it('returns false if not deleting instrument', () => {
            jest.spyOn(selectors.instruments, 'isDeleting').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isDeletingInstrument('123')).toEqual(false);
            expect(selectors.instruments.isDeleting).toHaveBeenCalledWith('123');
        });
    });

    describe('#isLoadingConfig()', () => {
        it('returns true if loading config', () => {
            jest.spyOn(selectors.config, 'isLoading').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingConfig()).toEqual(true);
            expect(selectors.config.isLoading).toHaveBeenCalledWith();
        });

        it('returns false if not loading config', () => {
            jest.spyOn(selectors.config, 'isLoading').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isLoadingConfig()).toEqual(false);
            expect(selectors.config.isLoading).toHaveBeenCalled();
        });
    });

    describe('#isPaymentStepPending()', () => {
        it('returns true if widget is interacting', () => {
            jest.spyOn(selectors.paymentStrategies, 'isWidgetInteracting').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isPaymentStepPending()).toEqual(true);
            expect(selectors.paymentStrategies.isWidgetInteracting).toHaveBeenCalled();
        });

        it('returns false if widget is not interacting', () => {
            jest.spyOn(selectors.paymentStrategies, 'isWidgetInteracting').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isPaymentStepPending()).toEqual(false);
            expect(selectors.paymentStrategies.isWidgetInteracting).toHaveBeenCalled();
        });

        it('returns true if strategy is initializing', () => {
            jest.spyOn(selectors.paymentStrategies, 'isInitializing').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isPaymentStepPending()).toEqual(true);
            expect(selectors.paymentStrategies.isInitializing).toHaveBeenCalled();
        });

        it('returns false if strategy is not initializing', () => {
            jest.spyOn(selectors.paymentStrategies, 'isInitializing').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isPaymentStepPending()).toEqual(false);
            expect(selectors.paymentStrategies.isInitializing).toHaveBeenCalled();
        });

        it('returns true if strategy is executing', () => {
            jest.spyOn(selectors.paymentStrategies, 'isExecuting').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isPaymentStepPending()).toEqual(true);
            expect(selectors.paymentStrategies.isExecuting).toHaveBeenCalled();
        });

        it('returns false if strategy is not executing', () => {
            jest.spyOn(selectors.paymentStrategies, 'isExecuting').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isPaymentStepPending()).toEqual(false);
            expect(selectors.paymentStrategies.isExecuting).toHaveBeenCalled();
        });

        it('returns true if strategy is finalizing', () => {
            jest.spyOn(selectors.paymentStrategies, 'isFinalizing').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isPaymentStepPending()).toEqual(true);
            expect(selectors.paymentStrategies.isFinalizing).toHaveBeenCalled();
        });

        it('returns false if strategy is not finalizing', () => {
            jest.spyOn(selectors.paymentStrategies, 'isFinalizing').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isPaymentStepPending()).toEqual(false);
            expect(selectors.paymentStrategies.isFinalizing).toHaveBeenCalled();
        });
    });

    describe('#isCustomerStepPending()', () => {
        it('returns true if widget is interacting', () => {
            jest.spyOn(selectors.customerStrategies, 'isWidgetInteracting').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isCustomerStepPending()).toEqual(true);
            expect(selectors.customerStrategies.isWidgetInteracting).toHaveBeenCalled();
        });

        it('returns false if widget is not interacting', () => {
            jest.spyOn(selectors.customerStrategies, 'isWidgetInteracting').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isCustomerStepPending()).toEqual(false);
            expect(selectors.customerStrategies.isWidgetInteracting).toHaveBeenCalled();
        });

        it('returns true if strategy is initializing', () => {
            jest.spyOn(selectors.customerStrategies, 'isInitializing').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isCustomerStepPending()).toEqual(true);
            expect(selectors.customerStrategies.isInitializing).toHaveBeenCalled();
        });

        it('returns false if strategy is not initializing', () => {
            jest.spyOn(selectors.customerStrategies, 'isInitializing').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isCustomerStepPending()).toEqual(false);
            expect(selectors.customerStrategies.isInitializing).toHaveBeenCalled();
        });

        it('returns true if strategy is executing', () => {
            jest.spyOn(selectors.customerStrategies, 'isSigningIn').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isCustomerStepPending()).toEqual(true);
            expect(selectors.customerStrategies.isSigningIn).toHaveBeenCalled();
        });

        it('returns false if strategy is not executing', () => {
            jest.spyOn(selectors.customerStrategies, 'isSigningIn').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isCustomerStepPending()).toEqual(false);
            expect(selectors.customerStrategies.isSigningIn).toHaveBeenCalled();
        });

        it('returns true if strategy is finalizing', () => {
            jest.spyOn(selectors.customerStrategies, 'isSigningOut').mockReturnValue(true);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isCustomerStepPending()).toEqual(true);
            expect(selectors.customerStrategies.isSigningOut).toHaveBeenCalled();
        });

        it('returns false if strategy is not finalizing', () => {
            jest.spyOn(selectors.customerStrategies, 'isSigningOut').mockReturnValue(false);

            const statuses = createCheckoutStoreStatusSelector(selectors);

            expect(statuses.isCustomerStepPending()).toEqual(false);
            expect(selectors.customerStrategies.isSigningOut).toHaveBeenCalled();
        });
    });
});
