import { ContinueHandler } from './continue-handler';
import { StepHandler } from './step-handler';

export const createStepHandler = (continueHandler: ContinueHandler) =>
    new StepHandler(continueHandler);
