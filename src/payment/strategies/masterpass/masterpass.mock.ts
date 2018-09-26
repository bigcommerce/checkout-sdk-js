import { Masterpass } from './masterpass';

export function getMasterpassScriptMock(): Masterpass {
    return {
        checkout: jest.fn(),
    };
}
