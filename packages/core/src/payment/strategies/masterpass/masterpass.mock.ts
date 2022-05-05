import { Masterpass } from './masterpass';

export function getMasterpassScriptMock(): Masterpass {
    return {
        checkout: jest.fn(),
    };
}

export function getCallbackUrlMock(): string {
    return 'http://localhost/checkout.php?action=set_external_checkout&provider=masterpass&gateway=stripe&origin=checkout';
}
