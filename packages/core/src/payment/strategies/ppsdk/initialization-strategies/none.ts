import { InitializationStrategy } from '../../../';

interface None {
    type: 'none';
}

export const isNone = (strategy: Pick<InitializationStrategy, 'type'>): strategy is None =>
    strategy.type === 'none';
