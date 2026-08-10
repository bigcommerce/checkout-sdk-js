import B2BStorefrontTokenService from './b2b-storefront-token-service';
import { CompanyAddressSearchOptions, CompanyAddressSearchResult } from './company-address';
import CompanyAddressRequestSender from './company-address-request-sender';

export default class CompanyAddressService {
    constructor(
        private _b2bStorefrontTokenService: B2BStorefrontTokenService,
        private _requestSender: CompanyAddressRequestSender,
    ) {}

    async searchAddresses(
        searchQuery: string,
        options?: CompanyAddressSearchOptions,
    ): Promise<CompanyAddressSearchResult> {
        const storefrontToken = await this._b2bStorefrontTokenService.getToken({
            timeout: options?.timeout,
        });

        return this._requestSender.searchAddresses(storefrontToken, searchQuery, options);
    }
}
