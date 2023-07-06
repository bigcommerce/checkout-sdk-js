import { Extension } from './extension';
import { ExtensionCommandHandlers } from './extension-command-handler';
import { ExtensionPostEvent } from './extension-post-event';
import { ExtensionState } from './extension-state';

export function getExtensions(): Extension[] {
    return [
        {
            id: '123',
            name: 'Foo',
            region: 'shipping.shippingAddressForm.before',
            url: 'https://widget.foo.com/',
        },
        {
            id: '456',
            name: 'Bar',
            region: 'shipping.shippingAddressForm.after',
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

export function getExtensionCommandHandlers(): ExtensionCommandHandlers {
    return {
        RELOAD_CHECKOUT: jest.fn(),
        SHOW_LOADING_INDICATOR: jest.fn(),
    };
}

export function getExtensionMessageEvent(): {
    origin: string;
    data: ExtensionPostEvent;
} {
    return {
        origin: 'https://widget.foo.com',
        data: {
            type: 'RELOAD_CHECKOUT',
            payload: {
                extensionId: '123',
            },
        },
    };
}

export function getHostMessageEvent(): {
    origin: string;
    data: ExtensionPostEvent;
} {
    return {
        origin: 'https://store.url',
        data: {
            type: 'HOST_COMMAND',
            payload: {
                message: 'sample',
            },
        },
    };
}
