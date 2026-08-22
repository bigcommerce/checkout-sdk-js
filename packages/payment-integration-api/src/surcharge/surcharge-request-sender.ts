import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, SDK_VERSION_HEADERS } from '../common/http-request';
import { RequestOptions } from '../util-types';

// Provider-agnostic: FE forwards whatever card handle it holds (Adyen
// encryptedCardNumber / BIN, Bluesnap pfToken / ccBin). BE proxies it to the provider
// (Adyen /cardDetails, Bluesnap /surcharge/calculate), applies compliance rules, and
// returns a normalized surcharge value.
export interface SurchargeCheckInput {
    methodId: string;
    cardData: Record<string, unknown>;
}

export interface SurchargeCheckResponse {
    eligible: boolean;
    amount: number;
    displayName: string;
    name: string;
    source: string;
    taxClassId?: number;
}

export default class SurchargeRequestSender {
    constructor(private _requestSender: RequestSender) {}

    checkSurcharge(
        checkoutId: string,
        body: SurchargeCheckInput,
        { timeout }: RequestOptions = {},
    ): Promise<Response<SurchargeCheckResponse>> {
        // NOTE: this endpoint is not implemented on the BE yet.
        const url = `/api/storefront/checkouts/${checkoutId}/surcharge-check`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender.post(url, { headers, timeout, body });
    }
}
