import { Initializer } from './intializer';

export const offSite: Initializer = async ({ options, store }) => {
    const { methodId } = options;
    // TODO: consider passing in key values like this unpacked
    const provider = store.getState().payment.getPaymentId()?.providerId;

    if (!provider) {
        // TODO: Do we want to throw or reject in this scenario?
        throw new Error();
    }

    return () => fetch(`/payment/${provider}.${methodId}`, { method: 'POST' });
};
