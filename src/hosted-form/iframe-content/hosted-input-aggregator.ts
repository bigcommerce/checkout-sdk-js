import HostedInput from './hosted-input';
import HostedInputValues from './hosted-input-values';
import HostedInputWindow from './hosted-input-window';

export default class HostedInputAggregator {
    constructor(
        private _parentWindow: Window
    ) {}

    getInputs(filter?: (field: HostedInput) => boolean): HostedInput[] {
        return Array.prototype.slice.call(this._parentWindow.frames)
            .reduce((result: Window[], frame: Window) => {
                const input = (frame as HostedInputWindow).hostedInput;

                if (!input || (filter && !filter(input))) {
                    return result;
                }

                return [...result, input];
            }, []);
    }

    getInputValues(filter?: (field: HostedInput) => boolean): HostedInputValues {
        return this.getInputs(filter)
            .reduce((result, input) => {
                return {
                    ...result,
                    [input.getType()]: input.getValue(),
                };
            }, {} as HostedInputValues);
    }
}
