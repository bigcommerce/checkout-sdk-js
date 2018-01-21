import { Observable } from 'rxjs/Observable';
import Action from './action';
import ReadableDataStore from './readable-data-store';

export default interface DispatchableDataStore<TTransformedState, TAction extends Action> extends ReadableDataStore<TTransformedState> {
    dispatch: <TDispatchAction extends TAction>(
        action: TDispatchAction | Observable<TDispatchAction>,
        options?: DispatchOptions
    ) => Promise<TTransformedState>;
}

export interface DispatchOptions {
    queueId?: string;
}
