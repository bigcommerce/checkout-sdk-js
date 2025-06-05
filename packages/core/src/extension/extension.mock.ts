import { getConsignments } from '../shipping/consignments.mock';

import { Extension, ExtensionRegion, ExtensionType } from './extension';
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
            type: ExtensionType.Iframe,
        },
        {
            id: '456',
            name: 'Bar',
            region: ExtensionRegion.ShippingShippingAddressFormAfter,
            url: 'https://widget.bar.com/',
            type: ExtensionType.Iframe,
        },
    ];
}

export function getWorkerExtension(): Extension {
    return {
        id: '789',
        name: 'Worker Extension',
        region: ExtensionRegion.GlobalWebWorker,
        url: 'https://worker.extension.com/worker.js',
        type: ExtensionType.Worker,
    };
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

// Mock Worker implementation for testing purposes
export class MockWorker {
    url: string;
    onmessage: ((this: Worker, ev: MessageEvent) => any) | null = null;
    onerror: ((this: Worker, ev: ErrorEvent) => any) | null = null;
    // Using jest.Mock for postMessage to spy on its calls
    postMessage: jest.Mock;
    constructor(url: string) {
        this.url = url;
        this.postMessage = jest.fn();
    }
    terminate(): void {
        /* mock */
    }
    addEventListener(): void {
        /* mock */
    }
    removeEventListener(): void {
        /* mock */
    }
    dispatchEvent(): boolean {
        return true; /* mock */
    }
}
