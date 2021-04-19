/*
    SDKHostedFormFactory would be a nuanced version of HostedFormFactory
        (1) allowing the post action to be constructed as needed
            e.g. `/payment/${paymentProvider}.${methodId}/${paymentId}`
        (2) transparently return the response from this submission
            allowing it to be processed up in the strategy scope
*/

import { SDKHostedFormFactory } from '../../../../hosted-form';
import { OrderPaymentRequestBody } from '../../../../order';

import { Initializer } from './intializer';

export const card: Initializer = async config => {
    const hostedFormFactory = new SDKHostedFormFactory(config.store);

    const host = ''; // Discerned from config/payment method options etc
    const formOptions = {
        // props discerned from config/payment method config.options etc
    };

    const form = hostedFormFactory.create(host, formOptions);

    await form.attach();

    return async (paymentRequest?: OrderPaymentRequestBody) => {
        if (!paymentRequest) {
            // TODO: Do we want to throw or reject in this scenario?
            throw new Error();
        }

        const formIsValid = form.validate();

        if (!formIsValid) {
            // TODO: Do we want to throw or reject in this scenario?
            throw new Error();
        }

        const response = await form.submit(paymentRequest);

        return response;
    };
};
