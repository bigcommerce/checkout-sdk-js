import {
    ChasePayEventMap,
    ChasePayPaymentSuccessPayload,
    JPMC,
} from './chasepay';

export function getChasePayScriptMock(): JPMC {
    return {
        EventType: {} as ChasePayEventMap,
        isChasePayUp: jest.fn(),
        insertButtons: jest.fn(),
        on: jest.fn(),
    };
}
