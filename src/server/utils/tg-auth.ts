import crypto from 'crypto';
import { TextEncoder } from 'util';
import * as _ from 'lodash';

import { getEnv } from './get-env';

const TG_AUTH_PARAMETERS = ['auth_date', 'hash', 'id', 'username', 'first_name', 'last_name', 'photo_url'];
const TG_AUTH_CHECK_HASH_OMIT_PARAMETERS = ['hash'];
const BOT_TOKEN = getEnv('TG_BOT_TOKEN');
const encoder = new TextEncoder();

export const pickAuthParameters = (parameters: Record<string, string>) => {
    return _.pick(parameters, TG_AUTH_PARAMETERS);
};

// @see https://core.telegram.org/widgets/login#checking-authorization
// @see https://gist.github.com/MarvinMiles/f041205d872b0d8547d054eafeafe2a5
export const getAuthHash = async (allParams: Record<string, string>): Promise<string> => {
    const params = _.omit(allParams, TG_AUTH_CHECK_HASH_OMIT_PARAMETERS);
    const dataElements: string[] = [];

    for (const entry of Object.entries(params)) {
        dataElements.push(`${entry[0]}=${entry[1]}`);
    }

    const dataString = dataElements.sort().join('\n');

    const tokenKey = await crypto.webcrypto.subtle.digest('sha-256', encoder.encode(BOT_TOKEN));
    const secretKey = await crypto.webcrypto.subtle.importKey('raw', tokenKey, { name: 'hmac', hash: 'sha-256' }, true, ['sign']);
    const signature = await crypto.webcrypto.subtle.sign('hmac', secretKey, encoder.encode(dataString));

    return [...new Uint8Array(signature)].map((b) => { return b.toString(16).padStart(2, '0'); }).join('');
};
