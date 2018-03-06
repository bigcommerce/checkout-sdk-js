import addMinutes from './add-minutes';

describe('addMinutes()', () => {
    it('adds minutes to the supplied time', () => {
        const date = new Date();

        expect(addMinutes(date, 5).getTime() - date.getTime()).toEqual(5 * 60 * 1000);
        expect(addMinutes(date, 100).getTime() - date.getTime()).toEqual(100 * 60 * 1000);
    });

    it('adds negative minutes to the supplied time', () => {
        const date = new Date();

        expect(addMinutes(date, -5).getTime() - date.getTime()).toEqual(-5 * 60 * 1000);
        expect(addMinutes(date, -100).getTime() - date.getTime()).toEqual(-100 * 60 * 1000);
    });
});
