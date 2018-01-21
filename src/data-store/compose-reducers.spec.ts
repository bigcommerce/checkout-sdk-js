import composeReducers from './compose-reducers';

describe('composeReducers()', () => {
    const fooReducer = (state = '', action) => {
        switch (action.type) {
        case 'FOO':
            return 'foo';

        case 'APPEND':
            return `${state}foo`;

        default:
            return state;
        }
    };

    const barReducer = (state = '', action) => {
        switch (action.type) {
        case 'BAR':
            return 'bar';

        case 'APPEND':
            return `${state}bar`;

        default:
            return state;
        }
    };

    it('composes multiple reducers', () => {
        const reducer = composeReducers(barReducer, fooReducer);
        const initialState = '';

        expect(reducer(initialState, { type: 'FOO' })).toEqual('foo');
        expect(reducer(initialState, { type: 'BAR' })).toEqual('bar');
        expect(reducer(initialState, { type: 'HELLO' })).toEqual('');
    });

    it('composes reducers from the right', () => {
        const reducer = composeReducers(barReducer, fooReducer);
        const initialState = '';

        expect(reducer(initialState, { type: 'APPEND' })).toEqual('foobar');
    });
});
