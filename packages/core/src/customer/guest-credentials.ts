import { Subscriptions } from '../subscription';

export type GuestCredentials = Partial<Subscriptions> & {
    id?: string;
    email: string;
};

export default GuestCredentials;
