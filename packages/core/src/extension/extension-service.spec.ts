import { noop } from 'lodash';

import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import {
    ExtensionListenEventMap,
    ExtensionListenEventType,
    ExtensionPostEvent,
    ExtensionPostEventType,
} from './extension-client';
import ExtensionService from './extension-service';

describe('ExtensionService', () => {
    let extensionService: ExtensionService;
    let eventListener: IframeEventListener<ExtensionListenEventMap>;
    let eventPoster: IframeEventPoster<ExtensionPostEvent>;

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

        const event: ExtensionPostEvent = {
            type: ExtensionPostEventType.FRAME_LOADED,
            payload: {},
        };

        extensionService.post(event);

        expect(eventPoster.post).toHaveBeenCalledWith({
            type: ExtensionPostEventType.FRAME_LOADED,
            payload: {
                extensionId: 1,
            },
        });
    });

    it('#addListener adds callback as noop if no callback method is passed', () => {
        extensionService.initialize('test');

        extensionService.addListener(ExtensionListenEventType.BroadcastCart);

        expect(eventListener.addListener).toHaveBeenCalledWith(
            ExtensionListenEventType.BroadcastCart,
            noop,
        );
    });

    it('#addListener is called correctly with params', () => {
        extensionService.initialize('test');

        const callbackFn = jest.fn();

        extensionService.addListener(ExtensionListenEventType.BroadcastCart, callbackFn);

        expect(eventListener.addListener).toHaveBeenCalledWith(
            ExtensionListenEventType.BroadcastCart,
            callbackFn,
        );
    });
});
