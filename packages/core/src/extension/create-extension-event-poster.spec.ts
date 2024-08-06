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

        // Info: This can't be fixed for now, because TS requires to create an iframe element to return from
        // query selector, however it is not possible to set contentWindow to an iframe element
        // since it is read only property
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
