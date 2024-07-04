import { IframeEventListener } from '../common/iframe';
import { InvalidHostedFormConfigError } from '../errors';
import { HostedFieldEventMap, HostedFieldEventType } from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';

import HostedInput from './hosted-input';
import HostedInputFactory from './hosted-input-factory';
import HostedInputInitializer from './hosted-input-initializer';
import HostedInputStorage from './hosted-input-storage';

describe('HostedInputInitializer', () => {
    let container: HTMLElement;
    let eventListener: IframeEventListener<HostedFieldEventMap>;
    let factory: Pick<HostedInputFactory, 'create' | 'normalizeParentOrigin'>;
    let initializer: HostedInputInitializer;
    let input: Pick<HostedInput, 'attach'>;
    let storage: Pick<HostedInputStorage, 'setNonce'>;

    beforeEach(() => {
        factory = { create: jest.fn(), normalizeParentOrigin: jest.fn() };
        storage = { setNonce: jest.fn() };
        eventListener = new IframeEventListener('https://store.foobar.com');
        input = { attach: jest.fn() };

        initializer = new HostedInputInitializer(
            factory as HostedInputFactory,
            storage as HostedInputStorage,
            eventListener,
        );

        container = document.createElement('div');
        container.id = 'input-container';
        document.body.appendChild(container);

        jest.spyOn(input, 'attach').mockImplementation();

        // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        jest.spyOn(factory, 'create').mockReturnValue(input);
    });

    afterEach(() => {
        container.remove();
    });

    it('creates new hosted input', async () => {
        process.nextTick(() => {
            eventListener.trigger({
                type: HostedFieldEventType.AttachRequested,
                payload: {
                    type: HostedFieldType.CardNumber,
                    accessibilityLabel: 'Name',
                    fontUrls: [],
                    placeholder: 'Card name',
                    styles: { default: { color: 'rgb(0, 0, 0)' } },
                },
            });
        });

        await initializer.initialize('input-container');

        expect(factory.create).toHaveBeenCalledWith(
            expect.any(HTMLFormElement),
            HostedFieldType.CardNumber,
            { default: { color: 'rgb(0, 0, 0)' } },
            [],
            'Card name',
            'Name',
        );
    });

    it('attaches input to container', async () => {
        process.nextTick(() => {
            eventListener.trigger({
                type: HostedFieldEventType.AttachRequested,
                payload: { type: HostedFieldType.CardNumber },
            });
        });

        await initializer.initialize('input-container');

        expect(input.attach).toHaveBeenCalled();
    });

    it('stores nonce into storage', async () => {
        process.nextTick(() => {
            eventListener.trigger({
                type: HostedFieldEventType.AttachRequested,
                payload: { type: HostedFieldType.CardNumber },
            });
        });

        await initializer.initialize('input-container', 'abc');

        expect(storage.setNonce).toHaveBeenCalledWith('abc');
    });

    it('returns newly created input', async () => {
        process.nextTick(() => {
            eventListener.trigger({
                type: HostedFieldEventType.AttachRequested,
                payload: { type: HostedFieldType.CardNumber },
            });
        });

        expect(await initializer.initialize('input-container')).toEqual(input);
    });

    it('throws error if container cannot be found', () => {
        container.remove();

        expect(() => initializer.initialize('input-container')).toThrow(
            InvalidHostedFormConfigError,
        );
    });

    it('normalises parent origin for input factory', async () => {
        process.nextTick(() => {
            eventListener.trigger({
                type: HostedFieldEventType.AttachRequested,
                payload: { type: HostedFieldType.CardNumber, origin: 'https://www.foobar.com' },
            });
        });

        await initializer.initialize('input-container');

        expect(factory.normalizeParentOrigin).toHaveBeenCalled();
    });
});
