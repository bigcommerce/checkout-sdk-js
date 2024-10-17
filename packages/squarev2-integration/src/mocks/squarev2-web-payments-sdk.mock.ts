import {
    CardFieldNamesValues,
    CardInputEvent,
    CardInputEventTypes,
    CardInputEventTypesValues,
    SqEvent,
} from '../types';

export function getSquareV2MockFunctions() {
    const attach = jest.fn().mockResolvedValue(undefined);
    const configure = jest.fn().mockResolvedValue(undefined);
    const tokenize = jest.fn().mockResolvedValue({ status: 'OK', token: 'cnon:xxx' });
    const destroy = jest.fn().mockResolvedValue(true);
    const listeners: Partial<{
        [key in CardInputEventTypes]: (event: SqEvent<CardInputEvent>) => void;
    }> = {};
    const addEventListener = jest
        .fn()
        .mockImplementation(
            (
                eventType: CardInputEventTypesValues,
                callback: (event: SqEvent<CardInputEvent>) => void,
            ) => {
                listeners[eventType] = callback;
            },
        );
    const simulateEvent = (
        type: CardInputEventTypesValues,
        field: CardFieldNamesValues,
        isCompletelyValid: boolean,
    ) => {
        const callback = listeners[type];

        if (callback) {
            const fakeEvent = {
                detail: {
                    field,
                    currentState: { isCompletelyValid },
                },
            };

            callback(fakeEvent as SqEvent<CardInputEvent>);
        }
    };
    const removeEventListener = jest.fn();
    const card = jest.fn().mockReturnValue({
        attach,
        configure,
        tokenize,
        destroy,
        addEventListener,
        removeEventListener,
    });
    const verifyBuyer = jest.fn().mockResolvedValue({ token: 'verf:yyy', userChallenged: true });
    const payments = jest.fn().mockReturnValue({ card, verifyBuyer });

    return {
        attach,
        configure,
        tokenize,
        destroy,
        addEventListener,
        simulateEvent,
        removeEventListener,
        card,
        verifyBuyer,
        payments,
    };
}
