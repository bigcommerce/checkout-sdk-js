import { resolveB2bBaseUrl } from '../b2b-dev-tools';
import { ReadableCheckoutStore } from '../checkout';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';

import B2BStorefrontTokenRequestSender from './b2b-storefront-token-request-sender';
import { CompanyAddressSearchOptions, CompanyAddressSearchResult } from './company-address';
import CompanyAddressRequestSender from './company-address-request-sender';

const STOREFRONT_TOKEN_LIFETIME_SECONDS = 3600;
const STOREFRONT_TOKEN_EXPIRY_BUFFER_SECONDS = 60;

interface CachedStorefrontToken {
    token: string;
    expiresAt: number;
    b2bToken: string;
}

export default class CompanyAddressService {
    private _storefrontToken?: CachedStorefrontToken;
    private _pendingTokenRequest?: { b2bToken: string; promise: Promise<string> };

    constructor(
        private _store: ReadableCheckoutStore,
        private _storefrontTokenRequestSender: B2BStorefrontTokenRequestSender,
        private _requestSender: CompanyAddressRequestSender,
    ) {}

    async searchAddresses(
        searchQuery: string,
        options?: CompanyAddressSearchOptions,
    ): Promise<CompanyAddressSearchResult> {
        const b2bToken = this._store.getState().b2bToken.getToken();

        if (!b2bToken) {
            throw new MissingDataError(MissingDataErrorType.MissingB2BToken);
        }

        const storefrontToken = await this._getStorefrontToken(b2bToken, options);

        return this._requestSender.searchAddresses(storefrontToken, searchQuery, options);
    }

    private _getStorefrontToken(
        b2bToken: string,
        options?: CompanyAddressSearchOptions,
    ): Promise<string> {
        const now = Math.floor(Date.now() / 1000);
        const cached = this._storefrontToken;

        if (
            cached &&
            cached.b2bToken === b2bToken &&
            now < cached.expiresAt - STOREFRONT_TOKEN_EXPIRY_BUFFER_SECONDS
        ) {
            return Promise.resolve(cached.token);
        }

        if (this._pendingTokenRequest?.b2bToken === b2bToken) {
            return this._pendingTokenRequest.promise;
        }

        const promise = this._fetchStorefrontToken(b2bToken, options).finally(() => {
            this._pendingTokenRequest = undefined;
        });

        this._pendingTokenRequest = { b2bToken, promise };

        return promise;
    }

    private async _fetchStorefrontToken(
        b2bToken: string,
        options?: CompanyAddressSearchOptions,
    ): Promise<string> {
        const state = this._store.getState();
        const { storeHash } = state.config.getStoreConfigOrThrow().storeProfile;
        // setting fallback baseUrl value to skip value check
        const { baseUrl = '' } = state.config.getStoreConfigOrThrow().b2bApiSettings ?? {};
        const { channelId } = state.checkout.getCheckoutOrThrow();
        const expiresAt = Math.floor(Date.now() / 1000) + STOREFRONT_TOKEN_LIFETIME_SECONDS;

        const token = await this._storefrontTokenRequestSender.createStorefrontToken(
            b2bToken,
            resolveB2bBaseUrl(baseUrl),
            {
                storeHash,
                channelId,
                expiresAt,
                allowedCorsOrigins: [window.location.origin],
            },
            { timeout: options?.timeout },
        );

        this._storefrontToken = { token, expiresAt, b2bToken };

        return token;
    }
}
