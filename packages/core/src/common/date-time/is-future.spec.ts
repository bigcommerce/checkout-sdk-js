import isFuture from './is-future';

describe('isFuture()', () => {
    it('detects that the supplied time is in the future', () => {
        const futureDate = new Date();

        futureDate.setMinutes(futureDate.getMinutes() + 5);

        expect(isFuture(futureDate)).toEqual(true);
    });

    it('detects that the supplied time is in the past', () => {
        const futureDate = new Date();

        futureDate.setMinutes(futureDate.getMinutes() - 5);

        expect(isFuture(futureDate)).toEqual(false);
    });
});
