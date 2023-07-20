import { ExtensionCommand } from './extension-command';

export type ExtensionCommandHandler = (data: ExtensionCommand) => void;
