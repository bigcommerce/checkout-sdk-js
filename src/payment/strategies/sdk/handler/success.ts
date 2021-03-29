interface SuccessResponse {
    type: 'success';
    // type def here
}

export const isSuccessResponse = (x: unknown): x is SuccessResponse => {
    // some type checking
    return true;
};

export const handleSuccessResponse = (success: SuccessResponse): Promise<void> => {
    // Possibly nothing more to do here but resolve and allow movement on to Order Confirmation?
    return Promise.resolve();
};
