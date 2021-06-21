import { InitializationStrategy } from '../../../';
interface None {
    type: 'NONE';
}

export const isNone = (strategy: Pick<InitializationStrategy, 'type'>): strategy is None =>
    strategy.type === 'NONE';
