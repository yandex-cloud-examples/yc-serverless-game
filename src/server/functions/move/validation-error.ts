import { functionResponse } from '../../utils/function-response';

export class ValidationError extends Error {
    toFunctionResponse() {
        return functionResponse({
            error: this.message,
        }, 400);
    }
}
