import { FormPoster } from '@bigcommerce/form-poster';

import { ContinueHandler } from './continue-handler';
import { StepHandler } from './step-handler';

export const createStepHandler = (formPoster: FormPoster) =>
    new StepHandler(new ContinueHandler(formPoster));
