import { includes } from 'lodash';

import HostedFieldType from '../hosted-field-type';

import HostedInput from './hosted-input';
import HostedInputAggregator from './hosted-input-aggregator';
import HostedInputWindow from './hosted-input-window';

describe('HostedInputAggregator', () => {
    let aggregator: HostedInputAggregator;
    let frames: HostedInputWindow[];
    let parentWindow: Pick<Window, 'frames'>;

    beforeEach(() => {
        parentWindow = Object.create(window);
        aggregator = new HostedInputAggregator(parentWindow as Window);
        frames = [
            Object.create(window),
            Object.create(window),
            Object.create(window),
            Object.create(window),
        ];

        const codeInput = {
            getType: jest.fn(() => HostedFieldType.CardCode),
            getValue: jest.fn(() => '123'),
        } as Pick<HostedInput, 'getType' | 'getValue'>;

        const expiryInput = {
            getType: jest.fn(() => HostedFieldType.CardExpiry),
            getValue: jest.fn(() => '10 / 20'),
        } as Pick<HostedInput, 'getType' | 'getValue'>;

        const nameInput = {
            getType: jest.fn(() => HostedFieldType.CardName),
            getValue: jest.fn(() => 'Good Shopper'),
        } as Pick<HostedInput, 'getType' | 'getValue'>;

        const numberInput = {
            getType: jest.fn(() => HostedFieldType.CardNumber),
            getValue: jest.fn(() => '4111 1111 1111 1111'),
        } as Pick<HostedInput, 'getType' | 'getValue'>;

        frames[0].hostedInput = codeInput as HostedInput;
        frames[1].hostedInput = expiryInput as HostedInput;
        frames[2].hostedInput = nameInput as HostedInput;
        frames[3].hostedInput = numberInput as HostedInput;

        (parentWindow as any).frames = frames;
    });

    it('gathers all adjacent hosted inputs', () => {
        expect(aggregator.getInputs())
            .toEqual(frames.map(frame => frame.hostedInput));
    });

    it('gathers all adjacent hosted inputs that satisfy filter', () => {
        expect(aggregator.getInputs(field => includes([HostedFieldType.CardCode, HostedFieldType.CardExpiry], field.getType())))
            .toEqual([frames[0].hostedInput, frames[1].hostedInput]);
    });

    it('gathers all values of adjacent hosted inputs', () => {
        expect(aggregator.getInputValues())
            .toEqual({
                [HostedFieldType.CardCode]: '123',
                [HostedFieldType.CardExpiry]: '10 / 20',
                [HostedFieldType.CardName]: 'Good Shopper',
                [HostedFieldType.CardNumber]: '4111 1111 1111 1111',
            });
    });

    it('gathers all values of adjacent hosted inputs that satisfy filter', () => {
        expect(aggregator.getInputValues(field => includes([HostedFieldType.CardCode, HostedFieldType.CardExpiry], field.getType())))
            .toEqual({
                [HostedFieldType.CardCode]: '123',
                [HostedFieldType.CardExpiry]: '10 / 20',
            });
    });
});
