import { IndividualCardElementOptions } from './stripev3';

export default function isIndividualCardElementOptions(
    individualCardElementOptions: any,
): individualCardElementOptions is IndividualCardElementOptions {
    return (
        individualCardElementOptions !== null &&
        typeof individualCardElementOptions === 'object' &&
        'cardNumberElementOptions' in individualCardElementOptions &&
        'cardCvcElementOptions' in individualCardElementOptions &&
        'cardExpiryElementOptions' in individualCardElementOptions &&
        typeof individualCardElementOptions.cardNumberElementOptions !== 'undefined' &&
        typeof individualCardElementOptions.cardCvcElementOptions !== 'undefined' &&
        typeof individualCardElementOptions.cardExpiryElementOptions !== 'undefined'
    );
}
