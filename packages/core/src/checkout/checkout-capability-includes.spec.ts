import { createTimeout } from '@bigcommerce/request-sender';
import { merge } from 'lodash';

import { Capabilities } from '../config/capabilities';
import { getConfigState } from '../config/configs.mock';

import { getCapabilityIncludes, withCapabilityIncludes } from './checkout-capability-includes';
import { CheckoutIncludes } from './checkout-params';
import createCheckoutStore from './create-checkout-store';

describe('checkout-capability-includes', () => {
    const getCapabilities = (
        userJourney: Partial<Capabilities['userJourney']> = {},
    ): Capabilities => ({ userJourney } as Capabilities);

    const createStoreWithCapabilities = (capabilities?: Capabilities) =>
        createCheckoutStore({
            config: merge({}, getConfigState(), {
                data: { storeConfig: { checkoutSettings: { capabilities } } },
            }),
        });

    describe('getCapabilityIncludes()', () => {
        it('returns no includes without capabilities', () => {
            expect(getCapabilityIncludes()).toEqual([]);
        });

        it('returns no includes when capabilities are disabled', () => {
            expect(getCapabilityIncludes(getCapabilities())).toEqual([]);
        });

        it('returns address extra field includes when hasAddressExtraFields is enabled', () => {
            expect(getCapabilityIncludes(getCapabilities({ hasAddressExtraFields: true }))).toEqual(
                [
                    CheckoutIncludes.BillingAddressExtraFields,
                    CheckoutIncludes.ConsignmentAddressExtraFields,
                    CheckoutIncludes.ConsignmentShippingAddressExtraFields,
                ],
            );
        });

        it('returns the customer addresses include when hasCompanyAddressBook is enabled', () => {
            expect(getCapabilityIncludes(getCapabilities({ hasCompanyAddressBook: true }))).toEqual(
                [CheckoutIncludes.CustomerAddressesB2B],
            );
        });

        it('returns all includes when both capabilities are enabled', () => {
            expect(
                getCapabilityIncludes(
                    getCapabilities({
                        hasAddressExtraFields: true,
                        hasCompanyAddressBook: true,
                    }),
                ),
            ).toEqual([
                CheckoutIncludes.BillingAddressExtraFields,
                CheckoutIncludes.ConsignmentAddressExtraFields,
                CheckoutIncludes.ConsignmentShippingAddressExtraFields,
                CheckoutIncludes.CustomerAddressesB2B,
            ]);
        });
    });

    describe('withCapabilityIncludes()', () => {
        it('returns options unchanged when config has no capabilities', () => {
            const options = {
                params: { include: [CheckoutIncludes.AvailableShippingOptions] },
            };

            expect(withCapabilityIncludes(createStoreWithCapabilities(), options)).toBe(options);
        });

        it('returns options unchanged when capabilities are disabled', () => {
            const options = {
                params: { include: [CheckoutIncludes.AvailableShippingOptions] },
            };

            expect(
                withCapabilityIncludes(createStoreWithCapabilities(getCapabilities()), options),
            ).toBe(options);
        });

        it('returns undefined when there are no capabilities and no options', () => {
            expect(withCapabilityIncludes(createStoreWithCapabilities())).toBeUndefined();
        });

        it('returns options unchanged when store config is not loaded', () => {
            const options = {
                params: { include: [CheckoutIncludes.AvailableShippingOptions] },
            };

            expect(withCapabilityIncludes(createCheckoutStore(), options)).toBe(options);
        });

        it('adds capability includes when options are not provided', () => {
            const store = createStoreWithCapabilities(
                getCapabilities({ hasCompanyAddressBook: true }),
            );

            expect(withCapabilityIncludes(store)).toEqual({
                params: { include: [CheckoutIncludes.CustomerAddressesB2B] },
            });
        });

        it('merges capability includes into an include list without duplicates', () => {
            const timeout = createTimeout();
            const store = createStoreWithCapabilities(
                getCapabilities({
                    hasAddressExtraFields: true,
                    hasCompanyAddressBook: true,
                }),
            );

            expect(
                withCapabilityIncludes(store, {
                    timeout,
                    params: {
                        include: [
                            CheckoutIncludes.AvailableShippingOptions,
                            CheckoutIncludes.BillingAddressExtraFields,
                        ],
                    },
                }),
            ).toEqual({
                timeout,
                params: {
                    include: [
                        CheckoutIncludes.AvailableShippingOptions,
                        CheckoutIncludes.BillingAddressExtraFields,
                        CheckoutIncludes.ConsignmentAddressExtraFields,
                        CheckoutIncludes.ConsignmentShippingAddressExtraFields,
                        CheckoutIncludes.CustomerAddressesB2B,
                    ],
                },
            });
        });

        it('does not override includes explicitly set by the caller in object form', () => {
            const store = createStoreWithCapabilities(
                getCapabilities({ hasAddressExtraFields: true }),
            );

            expect(
                withCapabilityIncludes(store, {
                    params: {
                        include: {
                            [CheckoutIncludes.BillingAddressExtraFields]: false,
                            [CheckoutIncludes.AvailableShippingOptions]: true,
                        },
                    },
                }),
            ).toEqual({
                params: {
                    include: {
                        [CheckoutIncludes.BillingAddressExtraFields]: false,
                        [CheckoutIncludes.ConsignmentAddressExtraFields]: true,
                        [CheckoutIncludes.ConsignmentShippingAddressExtraFields]: true,
                        [CheckoutIncludes.AvailableShippingOptions]: true,
                    },
                },
            });
        });
    });
});
