import { RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { CheckoutActionCreator, CheckoutRequestSender, CheckoutStore } from '../checkout';
import { Registry } from '../common/registry';
import { ConfigActionCreator, ConfigRequestSender } from '../config';
import { FormFieldsActionCreator, FormFieldsRequestSender } from '../form';
import {
    createSpamProtection,
    SpamProtectionActionCreator,
    SpamProtectionRequestSender,
} from '../spam-protection';

import CustomerActionCreator from './customer-action-creator';
import CustomerRequestSender from './customer-request-sender';
import { CustomerStrategy } from './strategies';
import { DefaultCustomerStrategy } from './strategies/default';

export default function createCustomerStrategyRegistry(
    store: CheckoutStore,
    requestSender: RequestSender,
): Registry<CustomerStrategy> {
    const registry = new Registry<CustomerStrategy>();
    const scriptLoader = getScriptLoader();
    const checkoutRequestSender = new CheckoutRequestSender(requestSender);
    const checkoutActionCreator = new CheckoutActionCreator(
        checkoutRequestSender,
        new ConfigActionCreator(new ConfigRequestSender(requestSender)),
        new FormFieldsActionCreator(new FormFieldsRequestSender(requestSender)),
    );
    const spamProtectionActionCreator = new SpamProtectionActionCreator(
        createSpamProtection(scriptLoader),
        new SpamProtectionRequestSender(requestSender),
    );
    const customerActionCreator = new CustomerActionCreator(
        new CustomerRequestSender(requestSender),
        checkoutActionCreator,
        spamProtectionActionCreator,
    );

    registry.register('default', () => new DefaultCustomerStrategy(store, customerActionCreator));

    return registry;
}
