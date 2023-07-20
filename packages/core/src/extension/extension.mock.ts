import { Extension, ExtensionRegion } from './extension';
import { ExtensionCommandType, ExtensionCommand } from './extension-command';
import { ExtensionState } from './extension-state';

export function getExtensions(): Extension[] {
    return [
        {
            id: '123',
            name: 'Foo',
            region: ExtensionRegion.ShippingShippingAddressFormBefore,
            url: 'https://widget.foo.com/',
        },
        {
            id: '456',
            name: 'Bar',
            region: ExtensionRegion.ShippingShippingAddressFormAfter,
            url: 'https://widget.bar.com/',
        },
    ];
}

export function getExtensionState(): ExtensionState {
    return {
        data: getExtensions(),
        errors: {},
        statuses: {},
    };
}

export function getExtensionMessageEvent(): {
    origin: string;
    data: ExtensionCommand;
} {
    return {
        origin: 'https://widget.foo.com',
        data: {
            type: ExtensionCommandType.ReloadCheckout,
            payload: {
                extensionId: '123',
            },
        },
    };
}
