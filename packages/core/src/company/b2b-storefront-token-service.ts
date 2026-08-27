import { ReadableCheckoutStore } from '../checkout';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import B2BStorefrontTokenRequestSender from './b2b-storefront-token-request-sender';

const STOREFRONT_TOKEN_LIFETIME_SECONDS = 3600;
const STOREFRONT_TOKEN_EXPIRY_BUFFER_SECONDS = 60;

interface CachedStorefrontToken {
    token: string;
    expiresAt: number;
    b2bToken: string;
}

export default class B2BStorefrontTokenService {
    private _storefrontToken?: CachedStorefrontToken;
    private _pendingTokenRequest?: { b2bToken: string; promise: Promise<string> };

    constructor(
        private _store: ReadableCheckoutStore,
        private _requestSender: B2BStorefrontTokenRequestSender,
    ) {}

    async getToken(options?: RequestOptions): Promise<string> {
        const b2bToken = this._store.getState().b2bToken.getToken();

        if (!b2bToken) {
            throw new MissingDataError(MissingDataErrorType.MissingB2BToken);
        }

        const now = Math.floor(Date.now() / 1000);
        const cached = this._storefrontToken;

        if (
            cached &&
            cached.b2bToken === b2bToken &&
            now < cached.expiresAt - STOREFRONT_TOKEN_EXPIRY_BUFFER_SECONDS
        ) {
            return cached.token;
        }

        if (this._pendingTokenRequest?.b2bToken === b2bToken) {
            return this._pendingTokenRequest.promise;
        }

        const promise = this._fetchToken(b2bToken, options).finally(() => {
            this._pendingTokenRequest = undefined;
        });

        this._pendingTokenRequest = { b2bToken, promise };

        return promise;
    }

    private async _fetchToken(b2bToken: string, options?: RequestOptions): Promise<string> {
        const state = this._store.getState();
        const { storeHash } = state.config.getStoreConfigOrThrow().storeProfile;
        // setting fallback baseUrl value to skip value check
        const { baseUrl = '' } = state.config.getStoreConfigOrThrow().b2bApiSettings ?? {};
        const { channelId } = state.checkout.getCheckoutOrThrow();
        const expiresAt = Math.floor(Date.now() / 1000) + STOREFRONT_TOKEN_LIFETIME_SECONDS;

        const token = await this._requestSender.createStorefrontToken(
            b2bToken,
            baseUrl,
            {
                storeHash,
                channelId,
                expiresAt,
                allowedCorsOrigins: [window.location.origin],
            },
            options,
        );

        this._storefrontToken = { token, expiresAt, b2bToken };

        return token;
    }
}
