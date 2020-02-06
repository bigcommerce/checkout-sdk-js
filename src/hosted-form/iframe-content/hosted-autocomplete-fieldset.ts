import { kebabCase } from 'lodash';

import { InvalidHostedFormConfigError } from '../errors';
import HostedFieldType from '../hosted-field-type';

import HostedInputAggregator from './hosted-input-aggregator';
import mapToAutocompleteType from './map-to-autocomplete-type';

export default class HostedAutocompleteFieldset {
    private _inputs: HTMLInputElement[];

    constructor(
        private _containerId: string,
        private _fieldTypes: HostedFieldType[],
        private _inputAggregator: HostedInputAggregator
    ) {
        this._inputs = this._fieldTypes.map(type => this._createInput(type));
    }

    attach(): void {
        const container = document.getElementById(this._containerId);

        if (!container) {
            throw new InvalidHostedFormConfigError('Unable to proceed because the provided container ID is not valid.');
        }

        this._inputs.forEach(input => container.appendChild(input));
    }

    detach(): void {
        this._inputs.forEach(input => {
            if (!input.parentElement) {
                return;
            }

            input.parentElement.removeChild(input);
        });
    }

    private _createInput(type: HostedFieldType): HTMLInputElement {
        const input = document.createElement('input');

        input.autocomplete = mapToAutocompleteType(type);
        input.id = this._getAutocompleteElementId(type);
        input.tabIndex = -1;
        input.style.position = 'absolute';
        input.style.opacity = '0';
        input.style.zIndex = '-1';

        input.addEventListener('change', this._handleChange);

        return input;
    }

    private _handleChange: (event: Event) => void = event => {
        const targetInput = event.target as HTMLInputElement;

        if (!targetInput) {
            throw new Error('Unable to get a reference to the target of the change event.');
        }

        const targetHostedInput = this._inputAggregator.getInputs()
            .find(input => this._getAutocompleteElementId(input.getType()) === targetInput.id);

        if (!targetHostedInput) {
            return;
        }

        targetHostedInput.setValue(targetInput.value);
    };

    private _getAutocompleteElementId(type: HostedFieldType): string {
        return `autocomplete-${kebabCase(type)}`;
    }
}
