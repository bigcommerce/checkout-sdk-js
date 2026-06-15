import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';
import { ShippingOption } from '../shipping';

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
    fieldValue: string | number | boolean | string[];
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

export interface CreateCompanyAddressPayload {
    addressLine1: string;
    addressLine2: string;
    city: string;
    label: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    zipCode: string;
    country: {
        countryCode: string;
        countryName: string;
    };
    state: {
        stateCode: string;
        stateName: string;
    };
    isBilling: 0 | 1;
    isCheckout: boolean;
    isShipping: 0 | 1;
    extraFields?: B2BExtraField[];
}

interface CreateCompanyAddressResponseBody {
    data: {
        addressId: string;
    };
    code: number;
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
                    authToken: b2bToken,
                    Authorization: `Bearer ${b2bToken}`,
                },
                body: payload,
            },
        );
    }

    async submitQuote(
        quoteId: number,
        payload: QuoteOrderedPayload,
        b2bToken: string,
        b2bBaseUrl: string,
    ): Promise<Response<void>> {
        return this._requestSender.post(`${b2bBaseUrl}/api/v2/rfq/${quoteId}/ordered`, {
            credentials: false,
            headers: {
                'Content-Type': 'application/json',
                authToken: b2bToken,
                Authorization: `Bearer ${b2bToken}`,
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
                authToken: b2bToken,
                Authorization: `Bearer ${b2bToken}`,
            },
            body: payload,
        });
    }

    async submitCompanyAddress(
        companyId: number,
        payload: CreateCompanyAddressPayload,
        b2bToken: string,
        b2bBaseUrl: string,
    ): Promise<Response<CreateCompanyAddressResponseBody>> {
        return this._requestSender.post(`${b2bBaseUrl}/api/v2/companies/${companyId}/addresses`, {
            credentials: false,
            headers: {
                'Content-Type': 'application/json',
                authToken: b2bToken,
                Authorization: `Bearer ${b2bToken}`,
            },
            body: payload,
        });
    }
}
