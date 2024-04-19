import { InitializationStrategy } from '../../../';

interface Card {
    type: 'card_ui';
}

export const isCard = (strategy: Pick<InitializationStrategy, 'type'>): strategy is Card =>
    strategy.type === 'card_ui';
