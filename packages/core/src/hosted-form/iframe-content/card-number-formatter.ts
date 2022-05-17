import { creditCardType, number } from 'card-validator';
import { max } from 'lodash';

const NUMBER_SEPARATOR = ' ';

export default class CardNumberFormatter {
    format(value: string): string {
        const { card } = number(value);

        if (!card) {
            return value;
        }

        const maxLength = max(creditCardType(value).map(info => max(info.lengths)));
        const unformattedValue = this.unformat(value).slice(0, maxLength);

        return card.gaps
            .filter(gapIndex => unformattedValue.length > gapIndex)
            .reduce((output, gapIndex, index) => (
                [
                    output.slice(0, gapIndex + index),
                    output.slice(gapIndex + index),
                ].join(NUMBER_SEPARATOR)
            ), unformattedValue);
    }

    unformat(value: string): string {
        const { card } = number(value);

        if (!card) {
            return value;
        }

        return value.replace(new RegExp(NUMBER_SEPARATOR, 'g'), '');
    }
}
