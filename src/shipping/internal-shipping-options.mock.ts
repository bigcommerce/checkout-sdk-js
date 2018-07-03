import InternalShippingOption, { InternalShippingOptionList } from './internal-shipping-option';

export function getShippingOptions(): InternalShippingOptionList {
    return {
        '55c96cda6f04c': [
            getFlatRateOption(),
        ],
    };
}

export function getFlatRateOption(): InternalShippingOption {
    return {
        description: 'Flat Rate',
        module: 'shipping_flatrate',
        price: 0,
        id: '0:61d4bb52f746477e1d4fb411221318c3',
        isRecommended: true,
        selected: true,
        imageUrl: '',
        transitTime: '',
    };
}
