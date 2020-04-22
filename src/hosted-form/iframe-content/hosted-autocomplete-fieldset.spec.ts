import HostedFieldType from '../hosted-field-type';

import HostedAutocompleteFieldset from './hosted-autocomplete-fieldset';
import HostedInput from './hosted-input';
import HostedInputAggregator from './hosted-input-aggregator';

describe('HostedAutocompleteFieldset', () => {
    let container: HTMLFormElement;
    let fieldset: HostedAutocompleteFieldset;
    let inputAggregator: Pick<HostedInputAggregator, 'getInputs'>;

    beforeEach(() => {
        inputAggregator = { getInputs: jest.fn() };

        container = document.createElement('form');
        document.body.appendChild(container);

        fieldset = new HostedAutocompleteFieldset(
            container,
            [HostedFieldType.CardExpiry, HostedFieldType.CardName],
            inputAggregator as HostedInputAggregator
        );
    });

    afterEach(() => {
        container.remove();
    });

    it('attaches autocomplete inputs to container', () => {
        fieldset.attach();

        expect(container.querySelector('#autocomplete-card-expiry'))
            .toBeTruthy();
        expect(container.querySelector('#autocomplete-card-name'))
            .toBeTruthy();
    });

    it('hides autocomplete input from user', () => {
        fieldset.attach();

        // tslint:disable-next-line:no-non-null-assertion
        const input = container.querySelector<HTMLInputElement>('#autocomplete-card-expiry')!;

        expect(input.style.opacity)
            .toEqual('0');
        expect(input.style.position)
            .toEqual('absolute');
        expect(input.tabIndex)
            .toEqual(-1);
    });

    it('configures autocomplete property based on field type', () => {
        fieldset.attach();

        // tslint:disable-next-line:no-non-null-assertion
        const expiryInput = container.querySelector<HTMLInputElement>('#autocomplete-card-expiry')!;
        // tslint:disable-next-line:no-non-null-assertion
        const nameInput = container.querySelector<HTMLInputElement>('#autocomplete-card-name')!;

        expect(expiryInput.autocomplete)
            .toEqual('cc-exp');
        expect(nameInput.autocomplete)
            .toEqual('cc-name');
    });

    it('updates corresponding hosted inputs when autocomplete inputs receive update', () => {
        const hostedExpiryInput: Pick<HostedInput, 'getType' | 'setValue'> = {
            getType: jest.fn(() => HostedFieldType.CardExpiry),
            setValue: jest.fn(),
        };
        const hostedNameInput: Pick<HostedInput, 'getType' | 'setValue'> = {
            getType: jest.fn(() => HostedFieldType.CardName),
            setValue: jest.fn(),
        };

        jest.spyOn(inputAggregator, 'getInputs')
            .mockReturnValue([hostedExpiryInput, hostedNameInput]);

        fieldset.attach();

        // tslint:disable-next-line:no-non-null-assertion
        const input = container.querySelector<HTMLInputElement>('#autocomplete-card-expiry')!;

        input.value = '10 / 20';
        input.dispatchEvent(new Event('change'));

        expect(hostedExpiryInput.setValue)
            .toHaveBeenCalledWith('10 / 20');
        expect(hostedNameInput.setValue)
            .not.toHaveBeenCalledWith('10 / 20');
    });

    it('removes autocomplete inputs when fieldset detaches', () => {
        fieldset.attach();
        fieldset.detach();

        expect(container.querySelector('#autocomplete-card-expiry'))
            .toBeFalsy();
        expect(container.querySelector('#autocomplete-card-name'))
            .toBeFalsy();
    });
});
