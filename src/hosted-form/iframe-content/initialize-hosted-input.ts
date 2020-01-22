import { IframeEventListener } from '../../common/iframe';
import { HostedFieldEventMap } from '../hosted-field-events';

import HostedInput from './hosted-input';
import HostedInputFactory from './hosted-input-factory';
import HostedInputInitializer from './hosted-input-initializer';
import HostedInputOptions from './hosted-input-options';

export default function initializeHostedInput(options: HostedInputOptions): Promise<HostedInput> {
    const { containerId, parentOrigin } = options;
    const initializer = new HostedInputInitializer(
        new HostedInputFactory(parentOrigin),
        new IframeEventListener<HostedFieldEventMap>(parentOrigin)
    );

    return initializer.initialize(containerId);
}
