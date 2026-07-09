import { union } from 'lodash';

import { RequestOptions } from '../common/http-request';
import { Capabilities } from '../config/capabilities';

import CheckoutParams, { CheckoutIncludeParam, CheckoutIncludes } from './checkout-params';
import { ReadableCheckoutStore } from './checkout-store';

const ADDRESS_EXTRA_FIELDS_INCLUDES = [
    CheckoutIncludes.BillingAddressExtraFields,
    CheckoutIncludes.ConsignmentAddressExtraFields,
    CheckoutIncludes.ConsignmentShippingAddressExtraFields,
];

const COMPANY_ADDRESS_BOOK_INCLUDES = [CheckoutIncludes.CustomerAddressesB2B];

export function getCapabilityIncludes(capabilities?: Capabilities): CheckoutIncludes[] {
    const userJourney = capabilities?.userJourney;

    return [
        ...(userJourney?.hasAddressExtraFields ? ADDRESS_EXTRA_FIELDS_INCLUDES : []),
        ...(userJourney?.hasCompanyAddressBook ? COMPANY_ADDRESS_BOOK_INCLUDES : []),
    ];
}

export function withCapabilityIncludes(
    store: ReadableCheckoutStore,
    options?: RequestOptions<CheckoutParams>,
): RequestOptions<CheckoutParams> | undefined {
    const capabilities = store.getState().config.getStoreConfig()?.checkoutSettings.capabilities;
    const capabilityIncludes = getCapabilityIncludes(capabilities);

    if (!capabilityIncludes.length) {
        return options;
    }

    return {
        ...options,
        params: {
            ...options?.params,
            include: mergeCapabilityIncludes(options?.params?.include, capabilityIncludes),
        },
    };
}

function mergeCapabilityIncludes(
    include: CheckoutParams['include'],
    capabilityIncludes: CheckoutIncludes[],
): CheckoutIncludes[] | CheckoutIncludeParam {
    if (include && !Array.isArray(include)) {
        return { ...toIncludeParam(capabilityIncludes), ...include };
    }

    return union(include, capabilityIncludes);
}

function toIncludeParam(includes: CheckoutIncludes[]): CheckoutIncludeParam {
    const includeParam: CheckoutIncludeParam = {};

    includes.forEach((include) => {
        includeParam[include] = true;
    });

    return includeParam;
}
