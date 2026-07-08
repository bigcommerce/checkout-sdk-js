import { Address } from '../address';
import { AddressExtraFieldValue } from '../form';

export default interface Customer {
    id: number;
    addresses: CustomerAddress[];
    storeCredit: number;
    /**
     * The email address of the signed in customer.
     */
    email: string;
    firstName: string;
    fullName: string;
    isGuest: boolean;
    lastName: string;
    /**
     * Indicates whether the customer should be prompted to sign-in.
     *
     * Note: You need to enable "Prompt existing accounts to sign in" in your Checkout Settings.
     */
    shouldEncourageSignIn: boolean;
    customerGroup?: CustomerGroup;
}

export interface CustomerAddress extends Address {
    id: number;
    type: string;
    /**
     * Company address metadata returned only for B2B company addresses, and
     * only when the `addresses.b2b` include is requested from the API.
     */
    b2b?: CustomerAddressB2B;
}

export interface CustomerAddressB2B {
    isShipping: boolean;
    isBilling: boolean;
    isDefaultShipping: boolean;
    isDefaultBilling: boolean;
    label: string;
    extraFields: AddressExtraFieldValue[];
}

export interface CustomerGroup {
    id: number;
    name: string;
}
