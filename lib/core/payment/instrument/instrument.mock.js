"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getInstrument() {
    return {
        bigpay_token: '123',
        provider: 'braintree',
        iin: '11111111',
        last_4: '4321',
        expiry_month: '02',
        expiry_year: '2020',
        brand: 'test',
        default_instrument: true,
    };
}
exports.getInstrument = getInstrument;
function getInstruments() {
    return [
        {
            bigpay_token: '123',
            provider: 'braintree',
            iin: '11111111',
            last_4: '4321',
            expiry_month: '02',
            expiry_year: '2020',
            brand: 'test',
            default_instrument: true,
        },
        {
            bigpay_token: '111',
            provider: 'authorizenet',
            iin: '11222333',
            last_4: '4444',
            expiry_month: '10',
            expiry_year: '2024',
            brand: 'test',
            default_instrument: true,
        },
    ];
}
exports.getInstruments = getInstruments;
function vaultInstrumentRequestBody() {
    return {
        providerName: 'Braintree',
        billingAddress: {
            addressLine1: '1-3 Smail St',
            addressLine2: 'Ultimo',
            city: 'Sydney',
            company: 'BigCommerce',
            countryCode: 'AU',
            email: 'shopper@bigcommerce.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: '98765432',
            postCode: '2007',
            provinceCode: 'NSW',
            province: 'New South Wales',
        },
        creditCard: {
            cardholderName: 'John Doe',
            number: '4111 1111 1111 1111',
            month: 11,
            year: 20,
            verificationCode: 993,
            issueMonth: 1,
            issueYear: 18,
            issueNumber: 1231231,
            trackData: '123',
            isManualEntry: true,
            iccData: '123',
            fallbackReason: 'test',
            isContactless: false,
            encryptedPinCryptogram: '123',
            encryptedPinKsn: '123',
            threeDSecure: {
                version: '1',
                status: 'test',
                vendor: 'braintree',
                cavv: '123',
                eci: '123',
                xid: '123',
            },
        },
        defaultInstrument: true,
    };
}
exports.vaultInstrumentRequestBody = vaultInstrumentRequestBody;
function getErrorInstrumentResponseBody() {
    return {
        errors: [{
                code: 400,
                message: 'Bad Request',
            }],
    };
}
exports.getErrorInstrumentResponseBody = getErrorInstrumentResponseBody;
function getInstrumentsState() {
    return {
        data: getInstruments(),
        meta: {},
    };
}
exports.getInstrumentsState = getInstrumentsState;
function getShopperTokenResponseBody() {
    return {
        data: {
            token: '123123123',
        },
        meta: {},
    };
}
exports.getShopperTokenResponseBody = getShopperTokenResponseBody;
function getInstrumentsResponseBody() {
    return {
        data: {
            vaulted_instruments: getInstruments(),
        },
        meta: {},
    };
}
exports.getInstrumentsResponseBody = getInstrumentsResponseBody;
function vaultInstrumentResponseBody() {
    return {
        data: {
            vaulted_instrument: getInstrument(),
        },
        meta: {},
    };
}
exports.vaultInstrumentResponseBody = vaultInstrumentResponseBody;
function deleteInstrumentResponseBody() {
    return {
        data: {},
        meta: {},
    };
}
exports.deleteInstrumentResponseBody = deleteInstrumentResponseBody;
//# sourceMappingURL=instrument.mock.js.map