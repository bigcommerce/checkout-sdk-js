import { IframeEventListener } from '../../common/iframe';
import { getCardInstrument } from '../../payment/instrument/instrument.mock';
import { InvalidHostedFormConfigError } from '../errors';
import { HostedFieldEventMap, HostedFieldEventType } from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';

import HostedInput from './hosted-input';
import HostedInputFactory from './hosted-input-factory';
import HostedInputInitializer from './hosted-input-initializer';

describe('HostedInputInitializer', () => {
    let container: HTMLElement;
    let eventListener: IframeEventListener<HostedFieldEventMap>;
    let factory: Pick<HostedInputFactory, 'create'>;
    let initializer: HostedInputInitializer;
    let input: Pick<HostedInput, 'attach'>;

    beforeEach(() => {
        factory = { create: jest.fn() };
        eventListener = new IframeEventListener('https://store.foobar.com');
        input = { attach: jest.fn() };

        initializer = new HostedInputInitializer(
            factory as HostedInputFactory,
            eventListener
        );

        container = document.createElement('div');
        container.id = 'input-container';
        document.body.appendChild(container);

        jest.spyOn(input, 'attach')
            .mockImplementation();

        jest.spyOn(factory, 'create')
            .mockReturnValue(input);
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
                    cardInstrument: getCardInstrument(),
                    fontUrls: [],
                    placeholder: 'Card name',
                    styles: { default: { color: 'rgb(0, 0, 0)' } },
                },
            });
        });

        await initializer.initialize('input-container');

        expect(factory.create)
            .toHaveBeenCalledWith(
                expect.any(HTMLFormElement),
                HostedFieldType.CardNumber,
                { default: { color: 'rgb(0, 0, 0)' } },
                [],
                'Card name',
                'Name',
                getCardInstrument()
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

        expect(input.attach)
            .toHaveBeenCalled();
    });

    it('returns newly created input', async () => {
        process.nextTick(() => {
            eventListener.trigger({
                type: HostedFieldEventType.AttachRequested,
                payload: { type: HostedFieldType.CardNumber },
            });
        });

        expect(await initializer.initialize('input-container'))
            .toEqual(input);
    });

    it('throws error if container cannot be found', () => {
        container.remove();

        expect(() => initializer.initialize('input-container'))
            .toThrowError(InvalidHostedFormConfigError);
    });
});
