import { VisaCheckoutAddress, VisaCheckoutPaymentSuccessPayload, VisaCheckoutSDK, VisaCheckoutTokenizedPayload, VisaCheckoutUserData } from './visacheckout';

export function getVisaCheckoutSDKMock(): VisaCheckoutSDK {
    return {
        init: jest.fn(),
        on: jest.fn(),
    };
}

export function getTokenizedPayload(): VisaCheckoutTokenizedPayload {
    return {
        nonce: 'my-nonce',
        details: {
            cardType: 'Visa',
            lastFour: '4111',
            lastTwo: '11',
        },
        description: 'this is a description',
        type: 'type1',
        billingAddress: getVisaCheckoutAddress(),
        shippingAddress: getVisaCheckoutAddress(),
        userData: getVisaCheckoutUserData(),
        binData: {
            commercial: 'bin_data_commercial',
            countryOfIssuance: 'bin_data_country_of_issuance',
            debit: 'bin_data_debit',
            durbinRegulated: 'bin_data_durbin_regulated',
            healthcare: 'bin_data_healthcare',
            issuingBank: 'bin_data_issuing_bank',
            payroll: 'bin_data_payroll',
            prepaid: 'bin_data_prepaid',
            productId: 'bin_data_product_id',
        },
    };
}

export function getPaymentSuccessPayload(): VisaCheckoutPaymentSuccessPayload {
    return {
        callid: 'caller_id',
        encKey: '25848dbb9c6772e1c6b24271a27e55a558c91507',
        encPaymentData: 'a397bb59616f5de338ed6759657dac07fff4737a6d3dbdca933d6e5fc9d82edbc310a47b91118cdf',
        partialShippingAddress: {
            countryCode: 'ES',
            postalCode: '2007',
        },
        paymentMethodType: 'TOKEN',
        responseStatus: {
            code: 200,
            message: 'All good',
            status: 200,
        },
    };
}
export function getVisaCheckoutAddress(): VisaCheckoutAddress {
    return {
        countryCode: 'ES',
        firstName: 'John',
        lastName: 'Doe',
        locality: 'Sydney',
        postalCode: '2008',
        region: 'NSW',
        streetAddress: '51 Main St.',
        extendedAddress: 'Ultimo',
        phoneNumber: '04877789875',
    };
}

export function getVisaCheckoutUserData(): VisaCheckoutUserData {
    return {
        userEmail: 'test@example.com',
        userFirstName: 'Johnathan',
        userLastName: 'Doyle',
        userFullName: 'Johnathan M. Doyle',
        userName: 'jdoyle',
    };
}

export function getVisaCheckoutRequestBody() {
    return {
        body: {
            action: 'set_external_checkout',
            billing_address: {
                address_line_1: '51 Main St.',
                address_line_2: 'Ultimo',
                city: 'Sydney',
                country_code: 'ES',
                email: 'test@example.com',
                first_name: 'John',
                last_name: 'Doe',
                phone_number: '04877789875',
                postal_code: '2008',
                state: 'NSW',
            },
            card_information: {
                number: '11',
                type: 'Visa',
            },
            device_data: 'my_device_session_id',
            nonce: 'my-nonce',
            payment_type: 'type1',
            provider: 'braintreevisacheckout',
            shipping_address: {
                address_line_1: '51 Main St.',
                address_line_2: 'Ultimo',
                city: 'Sydney',
                country_code: 'ES',
                email: 'test@example.com',
                first_name: 'John',
                last_name: 'Doe',
                phone_number: '04877789875',
                postal_code: '2008',
                state: 'NSW',
            },
        },
        headers: {
            Accept: 'text/html',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };
}
