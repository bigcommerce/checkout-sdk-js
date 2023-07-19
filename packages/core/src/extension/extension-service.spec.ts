import { noop } from 'lodash';

import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import {
    ExtensionCommandType,
    ExtensionListenEventMap,
    ExtensionListenEventType,
    ExtensionPostCommand,
} from './extension-client';
import ExtensionService from './extension-service';

describe('ExtensionService', () => {
    let extensionService: ExtensionService;
    let eventListener: IframeEventListener<ExtensionListenEventMap>;
    let eventPoster: IframeEventPoster<ExtensionPostCommand>;

    beforeEach(() => {
        eventListener = new IframeEventListener('https://mybigcommerce.com');
        eventPoster = new IframeEventPoster('https://mybigcommerce.com');

        jest.spyOn(eventListener, 'listen');
        jest.spyOn(eventListener, 'addListener');
        jest.spyOn(eventPoster, 'post');
        jest.spyOn(eventPoster, 'post');

        extensionService = new ExtensionService(eventListener, eventPoster);
    });

    it('#initializes success fully', () => {
        extensionService.initialize('test');

        expect(eventListener.listen).toHaveBeenCalled();
    });

    it('#initialize throws error if no extension Id is passed', () => {
        expect(() => extensionService.initialize(undefined as unknown as string)).toThrow(
            new Error('Extension Id not found.'),
        );
    });

    it('#post throws error if extension id is not set', () => {
        extensionService.initialize('test');

        const event: ExtensionPostCommand = {
            type: ExtensionCommandType.FRAME_LOADED,
            payload: {},
        };

        extensionService.post(event);

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: ExtensionCommandType.FRAME_LOADED,
            payload: {
                extensionId: 'test',
            },
        });
    });

    it('#post throws error if event name is not passed correctly', () => {
        extensionService.initialize('test');

        const event: ExtensionPostCommand = {
            type: 'some-event' as ExtensionCommandType,
            payload: {},
        };

        expect(() => extensionService.post(event)).toThrow('some-event is not supported.');
    });

    it('#addListener adds callback as noop if no callback method is passed', () => {
        extensionService.initialize('test');

        extensionService.addListener(ExtensionListenEventType.CheckoutLoaded);

        expect(eventListener.addListener).toHaveBeenCalledWith(
            ExtensionListenEventType.CheckoutLoaded,
            noop,
        );
    });

    it('#addListener is not called if event name is not correct', () => {
        extensionService.initialize('test');

        expect(() => extensionService.addListener('someevent' as ExtensionListenEventType)).toThrow(
            'someevent is not supported.',
        );
    });

    it('#addListener is called correctly with params', () => {
        extensionService.initialize('test');

        const callbackFn = jest.fn();

        extensionService.addListener(ExtensionListenEventType.CheckoutLoaded, callbackFn);

        expect(eventListener.addListener).toHaveBeenCalledWith(
            ExtensionListenEventType.CheckoutLoaded,
            callbackFn,
        );
    });
});
