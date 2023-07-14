import { ExtensionOriginEvent } from './extension-origin-event';

export type ExtensionCommandHandler = (data: ExtensionOriginEvent) => void;
