import { CustomError } from '../../common/error/errors';
import EmbeddedCheckoutStyles from '../embedded-checkout-styles';

export default interface EmbeddedCheckoutMessenger {
    postComplete(): void;
    postError(payload: Error | CustomError): void;
    postFrameError(payload: Error | CustomError): void;
    postFrameLoaded(): void;
    postLoaded(): void;
    receiveStyles(handler: (styles: EmbeddedCheckoutStyles) => void): void;
}
