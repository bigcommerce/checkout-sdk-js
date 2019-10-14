import { RequestSender } from '@bigcommerce/request-sender';

import { Address, LegacyAddress } from '../../../address';

import { BraintreeDataCollector } from './braintree';
import BraintreeSDKCreator from './braintree-sdk-creator';
import { VisaCheckoutAddress, VisaCheckoutInitOptions, VisaCheckoutPaymentSuccessPayload, VisaCheckoutTokenizedPayload } from './visacheckout';

export default class BraintreeVisaCheckoutPaymentProcessor {
    constructor(
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _requestSender: RequestSender
    ) {}

    initialize(clientToken: string, options: VisaCheckoutInitializeOptions): Promise<VisaCheckoutInitOptions> {
        this._braintreeSDKCreator.initialize(clientToken);

        return this._braintreeSDKCreator.getVisaCheckout()
            .then(visaCheckout => visaCheckout.createInitOptions({
                settings: {
                    locale: options.locale,
                    shipping: {
                        collectShipping: options.collectShipping,
                    },
                },
                paymentRequest: {
                    currencyCode: options.currencyCode,
                    subtotal: String(options.subtotal),
                },
            }));
    }

    deinitialize(): Promise<void> {
        return this._braintreeSDKCreator.teardown();
    }

    handleSuccess(payment: VisaCheckoutPaymentSuccessPayload, shipping?: Address, billing?: Address): Promise<any> {
        return this._braintreeSDKCreator.getVisaCheckout()
            .then(braintreeVisaCheckout => Promise.all([
                braintreeVisaCheckout.tokenize(payment),
                this._braintreeSDKCreator.getDataCollector(),
            ])
            .then(([tokenizedPayload, dataCollector]) => {
                const {
                    shippingAddress = this._toVisaCheckoutAddress(shipping),
                    billingAddress = this._toVisaCheckoutAddress(billing),
                } = tokenizedPayload;

                return this._postForm({
                    ...tokenizedPayload,
                    shippingAddress,
                    billingAddress,
                }, dataCollector);
            }));
    }

    private _postForm(paymentData: VisaCheckoutTokenizedPayload, dataCollector: BraintreeDataCollector) {
        const {
            userData,
            billingAddress,
            shippingAddress,
            details: cardInformation,
        } = paymentData;
        const { userEmail } = userData;
        const { deviceData } = dataCollector;

        return this._requestSender.post('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: {
                payment_type: paymentData.type,
                nonce: paymentData.nonce,
                provider: 'braintreevisacheckout',
                action: 'set_external_checkout',
                device_data: deviceData,
                card_information: this._getCardInformation(cardInformation),
                billing_address: this._getAddress(userEmail, billingAddress),
                shipping_address: this._getAddress(userEmail, shippingAddress),
            },
        });
    }

    private _toVisaCheckoutAddress(address?: Address): VisaCheckoutAddress {
        if (!address) {
            return {};
        }

        return {
            firstName: address.firstName,
            lastName: address.lastName,
            phoneNumber: address.phone,
            streetAddress: address.address1,
            extendedAddress: address.address2,
            locality: address.city,
            region: address.stateOrProvinceCode,
            countryCode: address.countryCode,
            postalCode: address.postalCode,
        };
    }

    private _getAddress(email: string, address: VisaCheckoutAddress = {}): Partial<LegacyAddress> {
        return {
            email,
            first_name: address.firstName,
            last_name: address.lastName,
            phone_number: address.phoneNumber,
            address_line_1: address.streetAddress,
            address_line_2: address.extendedAddress,
            city: address.locality,
            state: address.region,
            country_code: address.countryCode,
            postal_code: address.postalCode,
        };
    }

    private _getCardInformation(cardInformation: { cardType: string; lastTwo: string }) {
        return {
            type: cardInformation.cardType,
            number: cardInformation.lastTwo,
        };
    }
}

export interface VisaCheckoutInitializeOptions {
    locale?: string;
    collectShipping?: boolean;
    subtotal?: number;
    currencyCode?: string;
}
