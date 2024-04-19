import { FormPoster } from '@bigcommerce/form-poster';

import { PaymentHumanVerificationHandler } from '../../../../spam-protection';

import { ContinueHandler } from './continue-handler';
import { StepHandler } from './step-handler';

export const createStepHandler = (
    formPoster: FormPoster,
    humanVerificationHandler: PaymentHumanVerificationHandler,
) => new StepHandler(new ContinueHandler(formPoster, humanVerificationHandler));
