import { CustomError } from '../../common/error/errors';
import EmbeddedCheckoutStyles from '../embedded-checkout-styles';

import EmbeddedContentOptions from './embedded-content-options';

export default interface EmbeddedCheckoutMessenger {
    postComplete(): void;
    postError(payload: Error | CustomError): void;
    postFrameError(payload: Error | CustomError): void;
    postFrameLoaded(payload?: EmbeddedContentOptions): void;
    postLoaded(): void;
    postSignedOut(): void;
    receiveStyles(handler: (styles: EmbeddedCheckoutStyles) => void): void;
}
