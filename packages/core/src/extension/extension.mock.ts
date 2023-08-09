import { getConsignments } from '../shipping/consignments.mock';

import { Extension, ExtensionRegion } from './extension';
import { ExtensionEvent, ExtensionEventType } from './extension-client';
import { ExtensionCommand, ExtensionCommandType } from './extension-command';
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

export function getExtensionCommand(): {
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

export function getExtensionEvent(): {
    origin: string;
    data: ExtensionEvent;
} {
    return {
        origin: 'https://host.store',
        data: {
            type: ExtensionEventType.ConsignmentsChanged,
            payload: {
                consignments: getConsignments(),
                previousConsignments: [],
            },
        },
    };
}
