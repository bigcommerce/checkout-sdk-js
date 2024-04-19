import { IframeEventPoster } from '../../common/iframe';

import { HostedInputAttachErrorEvent, HostedInputEventType } from './hosted-input-events';
import HostedInputInitializeErrorData from './hosted-input-initialize-error-data';

const poster = new IframeEventPoster<HostedInputAttachErrorEvent>('*', window.parent);

export default function notifyInitializeError(error: HostedInputInitializeErrorData): void {
    poster.post({
        type: HostedInputEventType.AttachFailed,
        payload: { error },
    });
}
