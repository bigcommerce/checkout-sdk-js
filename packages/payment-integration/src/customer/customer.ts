import { Address } from '../address';

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
}

export interface CustomerGroup  {
    id: number;
    name: string;
}
