import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';
import { ShippingOption } from '../shipping';

import { B2BAuthTokens, getB2BAuthHeaders } from './b2b-auth-headers';

export interface CloseInvoicePayload {
    orderId: string;
    comment: string;
}

export interface CloseInvoiceResponseBody {
    data: {
        paymentId: string;
        receiptId: string;
    };
    code: number;
}

export interface B2BExtraField {
    fieldName: string;
    fieldValue: string | number;
}

export interface AddOrderExtraFieldsPayload {
    orderId: number;
    poNumber: string;
    referenceNumber: string;
    extraFields: B2BExtraField[];
    extraInfo: {
        addressExtraFields?: {
            billingAddressExtraFields: B2BExtraField[];
            shippingAddressExtraFields: B2BExtraField[];
        };
        billingAddressId?: number;
        shipppingAddressId?: number; // triple-p is intentional — wire contract
    };
}

export interface QuoteOrderedPayload {
    orderId: number;
    storeHash: string;
    shippingTotal: number | null;
    taxTotal: number;
    shippingMethod: ShippingOption | null;
    shippingAddress: {
        country: string;
        state: string;
        city: string;
        zipCode: string;
        address: string;
        apartment: string;
        firstName: string;
        lastName: string;
    } | null;
}

export default class B2BPostOrderRequestSender {
    constructor(private _requestSender: RequestSender) {}

    async submitInvoice(
        payload: CloseInvoicePayload,
        b2bToken: string,
        b2bBaseUrl: string,
        options?: RequestOptions,
    ): Promise<Response<CloseInvoiceResponseBody>> {
        return this._requestSender.post(
            `${b2bBaseUrl}/api/v1/ip/storefront/payments/bigcommerce/orders`,
            {
                timeout: options?.timeout,
                credentials: false,
                headers: {
                    'Content-Type': 'application/json',
                    ...getB2BAuthHeaders({ b2bToken }),
                },
                body: payload,
            },
        );
    }

    async submitQuote(
        quoteId: number,
        payload: QuoteOrderedPayload,
        auth: B2BAuthTokens,
        b2bBaseUrl: string,
    ): Promise<Response<void>> {
        return this._requestSender.post(`${b2bBaseUrl}/api/v2/rfq/${quoteId}/ordered`, {
            credentials: false,
            headers: {
                'Content-Type': 'application/json',
                ...getB2BAuthHeaders(auth),
            },
            body: payload,
        });
    }

    async submitOrderExtraFields(
        payload: AddOrderExtraFieldsPayload,
        b2bToken: string,
        b2bBaseUrl: string,
    ): Promise<Response<void>> {
        return this._requestSender.post(`${b2bBaseUrl}/api/v2/orders`, {
            credentials: false,
            headers: {
                'Content-Type': 'application/json',
                ...getB2BAuthHeaders({ b2bToken }),
            },
            body: payload,
        });
    }
}
