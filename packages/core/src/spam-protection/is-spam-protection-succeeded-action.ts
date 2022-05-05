import { ExecuteSucceededAction, SpamProtectionAction } from './spam-protection-actions';

export default function isSpamProtectionExecuteSucceededAction(action: SpamProtectionAction): action is ExecuteSucceededAction {
    const succeededAction = action as ExecuteSucceededAction;

    return typeof succeededAction === 'object' &&
        typeof succeededAction.payload === 'object' &&
        typeof succeededAction.payload.token === 'string';
}
