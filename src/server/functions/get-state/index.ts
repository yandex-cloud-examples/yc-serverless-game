import { Handler } from '@yandex-cloud/function-types';

export const handler: Handler = async (event, context) => {
    const x = 'hello world';

    return {
        statusCode: 200,
        body: x,
    };
};
