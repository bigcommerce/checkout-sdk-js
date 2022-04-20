import createSelector from './create-selector';

describe('createSelector()', () => {
    interface TestState {
        messages: string[];
    }

    it('creates selector that returns memorized function if combiner returns function', () => {
        const selector = createSelector(
            (state: TestState) => state.messages[0],
            message => (anotherMessage: string) => ({ message, anotherMessage })
        );

        const resultFn = selector({ messages: ['a', 'b'] });
        const resultFn2 = selector({ messages: ['a', 'b'] });

        expect(resultFn('hello'))
            .toEqual({ message: 'a', anotherMessage: 'hello' });
        expect(resultFn('hello'))
            .toBe(resultFn2('hello'));

        expect(resultFn2('bye'))
            .toEqual({ message: 'a', anotherMessage: 'bye' });
        expect(resultFn2('bye'))
            .not.toBe(resultFn('hello'));
    });
});
