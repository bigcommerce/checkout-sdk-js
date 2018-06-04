import {
    VisaCheckoutAddress,
    VisaCheckoutPaymentSuccessPayload,
    VisaCheckoutSDK,
    VisaCheckoutTokenizedPayload,
    VisaCheckoutUserData,
} from './visacheckout';

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
        body: 'payment_type=type1&nonce=my-nonce&provider=braintreevisacheckout&action=set_external_checkout&device_data=my_device_session_id&card_information=%7B%22type%22%3A%22Visa%22%2C%22number%22%3A%2211%22%7D&billing_address=%7B%22email%22%3A%22test%40example.com%22%2C%22first_name%22%3A%22John%22%2C%22last_name%22%3A%22Doe%22%2C%22phone_number%22%3A%2204877789875%22%2C%22address_line_1%22%3A%2251%20Main%20St.%22%2C%22address_line_2%22%3A%22Ultimo%22%2C%22city%22%3A%22Sydney%22%2C%22state%22%3A%22NSW%22%2C%22country_code%22%3A%22ES%22%2C%22postal_code%22%3A%222008%22%7D&shipping_address=%7B%22email%22%3A%22test%40example.com%22%2C%22first_name%22%3A%22John%22%2C%22last_name%22%3A%22Doe%22%2C%22phone_number%22%3A%2204877789875%22%2C%22address_line_1%22%3A%2251%20Main%20St.%22%2C%22address_line_2%22%3A%22Ultimo%22%2C%22city%22%3A%22Sydney%22%2C%22state%22%3A%22NSW%22%2C%22country_code%22%3A%22ES%22%2C%22postal_code%22%3A%222008%22%7D',
        headers: {
            Accept: 'text/html',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };
}
