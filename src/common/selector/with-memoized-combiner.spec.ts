import { createSelector } from 'reselect';

import withMemoizedCombiner from './with-memoized-combiner';

describe('createSelector()', () => {
    interface TestState {
        messages: string[];
    }

    it('decorates selector creator to return partially applied memoized combiner when selector is called', () => {
        const selector = withMemoizedCombiner(createSelector)(
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
