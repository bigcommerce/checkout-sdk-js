import { Extension, ExtensionRegions } from './extension';
import { ExtensionState } from './extension-state';

export function getExtensions(): Extension[] {
    return [
        {
            id: '123',
            name: 'Foo',
            region: ExtensionRegions.ShippingFulfillmentMethodsBefore,
            origin: 'https://widget.foo.com/',
            url: 'https://widget.foo.com/',
        },
        {
            id: '456',
            name: 'Bar',
            region: ExtensionRegions.ShippingFulfillmentMethodsAfter,
            origin: 'https://widget.bar.com/',
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
