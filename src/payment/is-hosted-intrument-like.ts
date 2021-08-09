import { HostedInstrument, PaymentInstrument } from './payment';

export default function isHostedInstrument(instrument: PaymentInstrument): instrument is HostedInstrument {
  const shouldSaveInstrument = Boolean((instrument as HostedInstrument).shouldSaveInstrument);
  const shouldSetAsDefaultInstrument = Boolean((instrument as HostedInstrument).shouldSetAsDefaultInstrument);

  return shouldSaveInstrument && shouldSetAsDefaultInstrument;
}
