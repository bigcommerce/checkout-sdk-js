import { PayPalFastlaneAuthenticationState } from '../bigcommerce-payments-types';

export default function getPayPalFastlaneAuthenticationResultMock() {
    return {
        authenticationState: PayPalFastlaneAuthenticationState.SUCCEEDED,
        profileData: {
            name: {
                fullName: 'John Doe',
                firstName: 'John',
                lastName: 'Doe',
            },
            shippingAddress: {
                address: {
                    company: 'BigCommerce',
                    addressLine1: 'addressLine1',
                    addressLine2: 'addressLine2',
                    adminArea1: 'addressState',
                    adminArea2: 'addressCity',
                    postalCode: '03004',
                    countryCode: 'US',
                },
                name: {
                    fullName: 'John Doe',
                    firstName: 'John',
                    lastName: 'Doe',
                },
                phoneNumber: {
                    nationalNumber: '5551113344',
                    countryCode: '1',
                },
            },
            card: {
                id: 'nonce/token',
                paymentSource: {
                    card: {
                        brand: 'Visa',
                        expiry: '2030-12',
                        lastDigits: '1111',
                        name: 'John Doe',
                        billingAddress: {
                            firstName: 'John',
                            lastName: 'Doe',
                            company: 'BigCommerce',
                            addressLine1: 'addressLine1',
                            addressLine2: 'addressLine2',
                            adminArea1: 'addressState',
                            adminArea2: 'addressCity',
                            postalCode: '03004',
                            countryCode: 'US',
                            phone: {
                                nationalNumber: '5551113344',
                                countryCode: '1',
                            },
                        },
                    },
                },
            },
        },
    };
}
