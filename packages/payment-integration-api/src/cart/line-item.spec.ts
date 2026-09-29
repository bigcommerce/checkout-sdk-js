import { LineItemOption } from './line-item';

describe('LineItemOption', () => {
    it('accepts number, string, and null valueId', () => {
        const options: LineItemOption[] = [
            { name: 'Color', nameId: 1, value: 'Red', valueId: 3 },
            { name: 'Color', nameId: 1, value: '123', valueId: '123' },
            { name: 'Color', nameId: 1, value: 'Custom', valueId: null },
        ];

        expect(options.map((option) => option.valueId)).toEqual([3, '123', null]);
    });
});
