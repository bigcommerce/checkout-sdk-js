import combineReducers from './combine-reducers';

describe('combineReducers()', () => {
    it('combines multiple reducers into one', () => {
        const fooReducer = jest.fn(() => 'foo');
        const barReducer = jest.fn(() => 'bar');
        const state = { foo: 'FOO', bar: 'BAR' };
        const action = { type: 'ACTION' };

        const reducer = combineReducers({
            foo: fooReducer,
            bar: barReducer,
        });

        expect(reducer(state, action)).toEqual({
            foo: 'foo',
            bar: 'bar',
        });
        expect(fooReducer).toHaveBeenCalledWith(state.foo, action);
        expect(barReducer).toHaveBeenCalledWith(state.bar, action);
    });
});
