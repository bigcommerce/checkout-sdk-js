import { IndividualCardElementOptions } from './stripev3';

export default function isIndividualCardElementOptions(
    individualCardElementOptions: unknown,
): individualCardElementOptions is IndividualCardElementOptions {
    return (
        Boolean(
            (individualCardElementOptions as IndividualCardElementOptions).cardNumberElementOptions,
        ) &&
        Boolean(
            (individualCardElementOptions as IndividualCardElementOptions).cardCvcElementOptions,
        ) &&
        Boolean(
            (individualCardElementOptions as IndividualCardElementOptions).cardExpiryElementOptions,
        )
    );
}
