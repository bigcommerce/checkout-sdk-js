import {
    AmazonPayV2ButtonConfig,
    AmazonPayV2ButtonParameters,
} from '@bigcommerce/checkout-sdk/amazon-pay-utils';

import { BuyNowCartRequestBody } from '../../../cart';

export function isWithBuyNowFeatures(options: unknown): options is WithBuyNowFeature {
    if (!(options instanceof Object)) {
        return false;
    }

    return 'buyNowInitializeOptions' in options;
}

export interface WithBuyNowFeature extends AmazonPayV2ButtonConfig {
    /**
     * The options that are required to initialize Buy Now functionality.
     */
    buyNowInitializeOptions?: {
        getBuyNowCartRequestBody?(): BuyNowCartRequestBody | void;
    };
}

/**
 * The required config to render the AmazonPayV2 button.
 */
export type AmazonPayV2ButtonInitializeOptions = AmazonPayV2ButtonParameters | WithBuyNowFeature;
