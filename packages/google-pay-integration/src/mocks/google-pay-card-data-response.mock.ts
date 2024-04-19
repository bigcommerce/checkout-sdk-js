import { GooglePayCardDataResponse, GooglePayCardNetwork } from '../types';

export default function getCardDataResponse(): GooglePayCardDataResponse {
    return {
        apiVersionMinor: 0,
        apiVersion: 2,
        paymentMethodData: {
            description: 'Visa••••1111',
            tokenizationData: {
                type: 'PAYMENT_GATEWAY',
                token: '{"signature":"foo","protocolVersion":"ECv1","signedMessage":{"encryptedMessage":"bar","ephemeralPublicKey":"baz","tag":"foobar"}}',
            },
            type: 'CARD',
            info: {
                cardNetwork: GooglePayCardNetwork.VISA,
                cardDetails: '1111',
                billingAddress: {
                    phoneNumber: '+1 555-555-5555',
                    address3: '',
                    sortingCode: '',
                    address2: 'Building 1, 1st Floor',
                    countryCode: 'US',
                    address1: '505 Oakland Ave',
                    postalCode: '78703',
                    name: 'John Doe',
                    locality: 'Austin',
                    administrativeArea: 'TX',
                },
            },
        },
        shippingAddress: {
            phoneNumber: '+1 555-555-5555',
            address3: '',
            sortingCode: '',
            address2: 'Building 2, Suite 100',
            countryCode: 'US',
            address1: '11305 4 Points Dr',
            postalCode: '78726',
            name: 'John Doe',
            locality: 'Austin',
            administrativeArea: 'TX',
        },
        email: 'john.doe@example.com',
    };
}
