import { Handler } from '@yandex-cloud/function-types';

export const functionResponse = (
    body: unknown,
    code = 200,
    contentType = 'application/json',
): ReturnType<Handler.Http> => {
    return {
        statusCode: code,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': contentType,
        },
    };
};
