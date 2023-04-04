import { BuyNowCartRequestBody } from '../../../cart';

export interface GooglePayBuyNowInitializeOptions {
    getBuyNowCartRequestBody?(): BuyNowCartRequestBody;
}
