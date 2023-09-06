import BillingAddress from './billing-address';

export default function isBillingAddressLike(address: any): address is BillingAddress {
    return (
        typeof address === 'object' &&
        address !== null &&
        'id' in address &&
        typeof address.id !== 'undefined'
    );
}
