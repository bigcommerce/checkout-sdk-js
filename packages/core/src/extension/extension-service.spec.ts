import EventEmitter from 'events';
import { noop } from 'lodash';

import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import {
    ExtensionCommand,
    ExtensionCommandContext,
    InstantDataCommandType,
} from './extension-commands';
import { ExtensionEventMap, ExtensionEventType } from './extension-events';
import {
    ExtensionInternalCommand,
    ExtensionInternalCommandType,
} from './extension-internal-commands';
import { ExtensionInternalEventType } from './extension-internal-events';
import {
    ExtensionMessageMap,
    ExtensionMessageType,
    GetConsignmentsMessage,
} from './extension-message';
import ExtensionService from './extension-service';

describe('ExtensionService', () => {
    let extensionService: ExtensionService;
    let messageListener: IframeEventListener<ExtensionMessageMap>;
    let eventListener: IframeEventListener<ExtensionEventMap>;
    let eventPoster: IframeEventPoster<ExtensionCommand, ExtensionCommandContext>;
    let internalEventPoster: IframeEventPoster<ExtensionInternalCommand>;

    beforeEach(() => {
        messageListener = new IframeEventListener('https://mybigcommerce.com');
        eventListener = new IframeEventListener('https://mybigcommerce.com');
        eventPoster = new IframeEventPoster('https://mybigcommerce.com');
        internalEventPoster = new IframeEventPoster('https://mybigcommerce.com');

        jest.spyOn(eventListener, 'listen');
        jest.spyOn(eventListener, 'addListener');
        jest.spyOn(eventPoster, 'post');
        jest.spyOn(internalEventPoster, 'post');

        extensionService = new ExtensionService(
            messageListener,
            eventListener,
            eventPoster,
            internalEventPoster,
        );
    });

    it('#initializes successfully', () => {
        void extensionService.initialize('test');

        expect(eventListener.listen).toHaveBeenCalled();
    });

    it('#initialize throws error if no extension Id is passed', async () => {
        await expect(extensionService.initialize(undefined as unknown as string)).rejects.toThrow(
            'Extension Id not found.',
        );
    });

    it('posts internal resize iframe command to host', () => {
        void extensionService.initialize('test');

        expect(internalEventPoster.post).toHaveBeenCalledWith(
            {
                type: ExtensionInternalCommandType.ResizeIframe,
                payload: { extensionId: 'test' },
            },
            {
                successType: ExtensionInternalEventType.ExtensionReady,
                errorType: ExtensionInternalEventType.ExtensionFailed,
            },
        );
    });

    it('throws error if host side asserts that the extension failed', async () => {
        jest.spyOn(internalEventPoster, 'post').mockRejectedValue({
            type: ExtensionInternalEventType.ExtensionFailed,
        });

        await expect(extensionService.initialize('test')).rejects.toThrow(
            'Extension failed to load within 60 seconds; please reload and try again.',
        );
    });

    it('#post throws error if event name is not passed correctly', () => {
        void extensionService.initialize('test');

        const event = {
            type: 'some-event',
        } as unknown as ExtensionCommand;

        expect(() => extensionService.post(event)).toThrow('some-event is not supported.');
    });

    it('#addListener adds callback as noop if no callback method is passed', () => {
        void extensionService.initialize('test');

        extensionService.addListener(ExtensionEventType.ConsignmentsChanged);

        expect(eventListener.addListener).toHaveBeenCalledWith(
            ExtensionEventType.ConsignmentsChanged,
            noop,
        );
    });

    it('#addListener is not called if event name is not correct', () => {
        void extensionService.initialize('test');

        expect(() => extensionService.addListener('someevent' as ExtensionEventType)).toThrow(
            'someevent is not supported.',
        );
    });

    it('#addListener is called correctly with params', () => {
        void extensionService.initialize('test');

        const callbackFn = jest.fn();

        extensionService.addListener(ExtensionEventType.ConsignmentsChanged, callbackFn);

        expect(eventListener.addListener).toHaveBeenCalledWith(
            ExtensionEventType.ConsignmentsChanged,
            callbackFn,
        );
    });

    it('gets data instantly', async () => {
        const eventEmitter = new EventEmitter();
        const replyMessage: GetConsignmentsMessage = {
            type: ExtensionMessageType.GetConsignments,
            payload: {
                consignments: [],
            },
        };

        jest.spyOn(window, 'addEventListener').mockImplementation((type, eventListener) => {
            const listener =
                typeof eventListener === 'function' ? eventListener : () => eventListener;

            return eventEmitter.addListener(type, listener);
        });
        jest.spyOn(eventPoster, 'post').mockImplementation(() => {
            eventEmitter.emit('message', {
                origin: 'https://mybigcommerce.com',
                data: replyMessage,
                type: ExtensionMessageType.GetConsignments,
            });

            return Promise.resolve(replyMessage);
        });
        jest.spyOn(messageListener, 'removeListener');

        void extensionService.initialize('test');

        expect(await extensionService.get(InstantDataCommandType.Consignments)).toBe(
            replyMessage.payload.consignments,
        );
        expect(messageListener.removeListener).toHaveBeenCalled();
    });

    it('throws error when trying to get unsupported data', async () => {
        void extensionService.initialize('test');

        await expect(extensionService.get('cart' as InstantDataCommandType)).rejects.toThrow(
            'Unsupported data type: cart',
        );
    });
});
