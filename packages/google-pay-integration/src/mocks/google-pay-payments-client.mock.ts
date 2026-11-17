import { GooglePayPaymentDataRequest } from '../types';

import getCardDataResponse from './google-pay-card-data-response.mock';

export default function getGooglePaymentsClientMocks() {
    const button = document.createElement('div');
    const cardDataResponse = getCardDataResponse();
    const paymentsClient = {
        isReadyToPay: jest.fn(() => Promise.resolve({ result: true })),
        createButton: jest.fn(() => button),
        loadPaymentData: jest.fn((request: GooglePayPaymentDataRequest) => {
            void request;

            return Promise.resolve(cardDataResponse);
        }),
        prefetchPaymentData: jest.fn(),
    };

    return {
        button,
        cardDataResponse,
        paymentsClient,
    };
}
