import { EventEmitter } from 'events';

import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { getConsignment } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    CallbackTriggerType,
    GooglePayFullBillingAddress,
    GooglePayInitializationData,
    GooglePayPaymentOptions,
    NewShippingOptionParameters,
    NewTransactionInfo,
} from '../types';

const defaultGPayShippingAddress: GooglePayFullBillingAddress = {
    address1: '',
    address2: '',
    address3: '',
    administrativeArea: 'US',
    locality: 'TX',
    sortingCode: '78726',
    name: '',
    postalCode: '',
    countryCode: '',
};

const consignment = getConsignment();

export const createInitializeImplementationMock = (
    eventEmitter: EventEmitter,
    callbackTrigger: CallbackTriggerType,
    cb?: (res?: NewTransactionInfo & NewShippingOptionParameters) => void,
) => {
    return (
        _: () => PaymentMethod<GooglePayInitializationData>,
        googlePayClientOptions?: GooglePayPaymentOptions,
    ) => {
        eventEmitter.on('onPaymentDataChanged', () => {
            if (googlePayClientOptions && googlePayClientOptions.paymentDataCallbacks) {
                googlePayClientOptions.paymentDataCallbacks
                    .onPaymentDataChanged({
                        callbackTrigger,
                        shippingAddress: defaultGPayShippingAddress,
                        shippingOptionData: {
                            id: consignment.selectedShippingOption
                                ? consignment.selectedShippingOption.id
                                : '',
                        },
                        offerData: {
                            redemptionCodes: ['coupon_code'],
                        },
                    })
                    .then((res) => {
                        if (cb) {
                            return cb(res || undefined);
                        }
                    })
                    .catch((e) => e);
            }
        });

        return Promise.resolve();
    };
};
