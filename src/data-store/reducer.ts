import Action from './action';

type Reducer<TState, TAction extends Action> = (state: TState, action: TAction) => TState;

export default Reducer;
