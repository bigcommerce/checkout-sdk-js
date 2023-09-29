import { IframeEventPoster } from '../common/iframe';

import { createExtensionEventPoster } from './create-extension-event-poster';
import { ExtensionNotFoundError } from './errors';
import { Extension } from './extension';
import { getExtensions } from './extension.mock';

describe('createExtensionEventPoster', () => {
    let extension: Extension;

    beforeEach(() => {
        extension = getExtensions()[0];
    });

    it('should return an instance of IframeEventPoster if the iframe and contentWindow exist', () => {
        const iframe = { contentWindow: {} };

        jest.spyOn(document, 'querySelector').mockReturnValue({
            querySelector: jest.fn(() => iframe),
        });

        const poster = createExtensionEventPoster(extension);

        expect(document.querySelector).toHaveBeenCalledWith('[data-extension-id="123"]');
        expect(poster).toBeInstanceOf(IframeEventPoster);
    });

    it('should throw ExtensionNotFoundError if the iframe or contentWindow do not exist', () => {
        jest.spyOn(document, 'querySelector').mockReturnValue(null);

        expect(() => createExtensionEventPoster(extension)).toThrow(ExtensionNotFoundError);
        expect(document.querySelector).toHaveBeenCalledWith('[data-extension-id="123"]');
    });
});
