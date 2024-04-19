import { getConsignments } from '../shipping/consignments.mock';

import { Extension, ExtensionRegion } from './extension';
import { ExtensionCommand, ExtensionCommandType } from './extension-commands';
import { ExtensionEvent, ExtensionEventType } from './extension-events';
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
