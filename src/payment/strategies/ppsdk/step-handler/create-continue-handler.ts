import { FormPoster } from '@bigcommerce/form-poster';

import { ContinueHandler } from './continue-handler';

export const createContinueHandler = (formPoster: FormPoster) =>
    new ContinueHandler(formPoster);
