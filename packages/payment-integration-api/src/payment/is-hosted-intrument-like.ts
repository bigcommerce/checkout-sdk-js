import { HostedInstrument } from './payment';

export default function isHostedInstrumentLike(
    instrument: unknown,
): instrument is HostedInstrument {
    return (
        typeof instrument === 'object' &&
        instrument !== null &&
        (typeof (instrument as HostedInstrument).shouldSaveInstrument === 'undefined' ||
            typeof (instrument as HostedInstrument).shouldSaveInstrument === 'boolean') &&
        (typeof (instrument as HostedInstrument).shouldSetAsDefaultInstrument === 'undefined' ||
            typeof (instrument as HostedInstrument).shouldSetAsDefaultInstrument === 'boolean')
    );
}
