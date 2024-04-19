import { InvalidArgumentError } from '../errors';

import guard from './guard';

describe('guard()', () => {
    it('throws error if value is null', () => {
        expect(() => guard(null)).toThrow();
    });

    it('throws error if value is undefined', () => {
        expect(() => guard(undefined)).toThrow();
    });

    it('does not throw error if value is 0', () => {
        expect(() => guard(0)).not.toThrow();
    });

    it('throws custom error if provided', () => {
        expect(() => guard(null, () => new InvalidArgumentError())).toThrow(InvalidArgumentError);
    });
});
