import { ExtensionCommand, ExtensionPostEvent, HostCommand } from './extension-post-event';

export type ExtensionCommandHandler = (data: ExtensionPostEvent) => void;

export type ExtensionCommandHandlers = Partial<
    Record<ExtensionCommand | HostCommand, ExtensionCommandHandler>
>;
