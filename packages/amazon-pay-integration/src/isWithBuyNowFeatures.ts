import { WithBuyNowFeature } from './amazon-pay-v2-button-options';

export function isWithBuyNowFeatures(options: unknown): options is WithBuyNowFeature {
    if (!(options instanceof Object)) {
        return false;
    }

    return 'buyNowInitializeOptions' in options;
}
