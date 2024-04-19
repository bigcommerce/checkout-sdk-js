import { GooglePayErrorObject } from '../types';

export default function isGooglePayErrorObject(error: unknown): error is GooglePayErrorObject {
    return typeof error === 'object' && error !== null && 'statusCode' in error;
}
