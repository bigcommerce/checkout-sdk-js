import { IframeEventListener } from '../../common/iframe';
import { getCardInstrument } from '../../payment/instrument/instrument.mock';
import { HostedFieldEventMap, HostedFieldEventType } from '../hosted-field-events';
import HostedFieldType from '../hosted-field-type';

import HostedInput from './hosted-input';
import HostedInputFactory from './hosted-input-factory';
import HostedInputInitializer from './hosted-input-initializer';

describe('HostedInputInitializer', () => {
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

        jest.spyOn(input, 'attach')
            .mockImplementation();

        jest.spyOn(factory, 'create')
            .mockReturnValue(input);
    });

    it('creates new hosted input', async () => {
        process.nextTick(() => {
            eventListener.trigger({
                type: HostedFieldEventType.AttachRequested,
                payload: {
                    type: HostedFieldType.CardNumber,
                    accessibilityLabel: 'Name',
                    cardInstrument: getCardInstrument(),
                    placeholder: 'Card name',
                    styles: { default: { color: 'rgb(0, 0, 0)' } },
                },
            });
        });

        await initializer.initialize('input-container');

        expect(factory.create)
            .toHaveBeenCalledWith(
                'input-container',
                HostedFieldType.CardNumber,
                { default: { color: 'rgb(0, 0, 0)' } },
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
});
