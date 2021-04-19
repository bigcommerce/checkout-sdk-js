import { card } from './card';
import { Initializer } from './intializer';

// Quite a naive map
// Probably should be an Enum, rather than 'string' etc
// The whole thing could even be a 'Registry'
// will large change based on _how_ we want to pick initializers
export const initializers: Record<string, Initializer> = {
    card,
};
