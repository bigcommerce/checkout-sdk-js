import createShallowEqualSelector from './create-shallow-equal-selector';

describe('createShallowEqualSelector()', () => {
    interface TestState {
        items: Array<{ id: number }>;
        messages: string[];
    }

    it('creates selector that does shallow comparison instead of strict comparison', () => {
        const combiner = jest.fn((messages: string[]) => messages.join(', '));
        const selector = createShallowEqualSelector(
            (state: TestState) => state.messages,
            combiner
        );

        const result = selector({ messages: ['a', 'b'], items: [] });
        const result2 = selector({ messages: ['a', 'b'], items: [] });

        expect(result)
            .toEqual('a, b');
        expect(result2)
            .toEqual('a, b');
        expect(combiner)
            .toHaveBeenCalledTimes(1);

        const result3 = selector({ messages: ['b', 'c'], items: [] });

        expect(result3)
            .toEqual('b, c');
        expect(combiner)
            .toHaveBeenCalledTimes(2);
    });

    it('creates selector that does shallow comparison instead of deep comparison', () => {
        const combiner = jest.fn((items: TestState['items']) => items.map(item => item.id).join(', '));
        const selector = createShallowEqualSelector(
            (state: TestState) => state.items,
            combiner
        );

        const item = { id: 1 };
        const item2 = { id: 2 };
        const result = selector({ items: [item, item2], messages: [] });
        const result2 = selector({ items: [item, item2], messages: [] });

        expect(result)
            .toEqual('1, 2');
        expect(result2)
            .toEqual('1, 2');
        expect(combiner)
            .toHaveBeenCalledTimes(1);

        const result3 = selector({ items: [{ ...item }, { ...item2 }], messages: [] });

        expect(result3)
            .toEqual('1, 2');
        expect(combiner)
            .toHaveBeenCalledTimes(2);
    });
});
