import { ExtensionCommand, ExtensionOriginEvent } from './extension-origin-event';

export type ExtensionCommandHandler = (data: ExtensionOriginEvent) => void;

export type ExtensionCommandHandlers = Partial<Record<ExtensionCommand, ExtensionCommandHandler>>;
