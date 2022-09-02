import * as cookie from 'cookie';
import { Handler } from '@yandex-cloud/function-types';
import * as uuid from 'uuid';
import { withDb } from '../../db/with-db';
import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME, PLAYER_IMAGE_TYPES_NUM } from '../../utils/constants';
import { functionResponse } from '../../utils/function-response';
import { getAuthHash, pickAuthParameters } from '../../utils/tg-auth';
import { User } from '../../db/entity/user';
import { UserState } from '../../../common/types';
import { getGameConfig } from '../../utils/get-game-config';
import { executeQuery } from '../../db/execute-query';

const TG_CDN_PREFIX = 'https://t.me/i/userpic';

const transformAvatarUrl = (originalUrl: string): string | undefined => {
    let result: string | undefined;

    if (originalUrl.startsWith(TG_CDN_PREFIX)) {
        result = originalUrl.replace(TG_CDN_PREFIX, '/proxy/tg-avatars');
    }

    return result;
};

const getRandomColor = (existingColors: string[]): string => {
    const MIN_COLOR = 0;
    const MAX_COLOR = 0xFF_FF_FF;
    const existingColorsNumbers = existingColors
        .map((c) => Number.parseInt(c, 16))
        .sort((a, b) => a - b);
    const colorsSet = [
        MIN_COLOR,
        ...existingColorsNumbers,
        MAX_COLOR,
    ];

    let startingColor = 0;
    let distance = 0;

    for (let i = 0; i < colorsSet.length - 1; i++) {
        const newColor = colorsSet[i];
        const newDistance = colorsSet[i + 1] - newColor;

        if (newDistance > distance) {
            distance = newDistance;
            startingColor = newColor;
        }
    }

    const randomBounds = distance / 100;
    const randomNum = (Math.random() - 0.5) * randomBounds;
    const colorNum = Math.abs(Math.round(startingColor + distance / 2 + randomNum));

    return Math.min(colorNum, MAX_COLOR).toString(16);
};

export const handler = withDb<Handler.Http>(async (dbSess, event, context) => {
    const authParameters = pickAuthParameters(event.queryStringParameters);
    const checkHash = await getAuthHash(authParameters);

    if (checkHash !== authParameters.hash) {
        return functionResponse({
            error: 'Bad parameters',
        }, 400);
    }

    const users = await User.all(dbSess);
    const isRegistered = users.some((u) => u.tgUserId === authParameters.id);

    if (!isRegistered) {
        const gameConfig = await getGameConfig(dbSess);
        const existingColors = users.map((u) => u.color);
        const randomColor = getRandomColor(existingColors);
        const login = authParameters.username ? `@${authParameters.username}` : `${authParameters.first_name}${authParameters.last_name}`;
        const tgAvatar = authParameters.photo_url && transformAvatarUrl(authParameters.photo_url);
        const imageType = Math.floor(Math.random() * PLAYER_IMAGE_TYPES_NUM + 1);
        const user = new User({
            id: uuid.v4(),
            color: randomColor,
            gridX: Math.floor(Math.random() * gameConfig.worldGridSize[0]),
            gridY: Math.floor(Math.random() * gameConfig.worldGridSize[0]),
            tgAvatar,
            lastActive: new Date(),
            state: UserState.DEFAULT,
            tgUsername: login,
            tgUserId: authParameters.id,
            imageType,
        });

        const createUserQuery = `
            DECLARE $id AS UTF8;
            DECLARE $color AS UTF8;
            DECLARE $gridX AS UINT32;
            DECLARE $gridY AS UINT32;
            DECLARE $tgAvatar AS UTF8?;
            DECLARE $lastActive AS TIMESTAMP;
            DECLARE $state AS UTF8;
            DECLARE $tgUsername AS UTF8;
            DECLARE $tgUserId AS UTF8;
            DECLARE $imageType AS UINT8;
            INSERT INTO Users (id, color, grid_x, grid_y, last_active, state, tg_avatar, tg_user_id, tg_username)
            VALUES ($id, $color, $gridX, $gridY, $lastActive, $state, $tgAvatar, $tgUserId, $tgUsername);
        `;

        await executeQuery(dbSess, createUserQuery, {
            $id: user.getTypedValue('id'),
            $color: user.getTypedValue('color'),
            $gridX: user.getTypedValue('gridX'),
            $gridY: user.getTypedValue('gridY'),
            $tgAvatar: user.getTypedValue('tgAvatar'),
            $lastActive: user.getTypedValue('lastActive'),
            $state: user.getTypedValue('state'),
            $tgUsername: user.getTypedValue('tgUsername'),
            $tgUserId: user.getTypedValue('tgUserId'),
            $imageType: user.getTypedValue('imageType'),
        });
    }

    const autCookie = cookie.serialize(AUTH_COOKIE_NAME, JSON.stringify(authParameters), {
        path: '/',
        maxAge: AUTH_COOKIE_MAX_AGE,
        httpOnly: true,
        secure: true,
    });

    return {
        statusCode: 302,
        headers: {
            'Set-Cookie': autCookie,
            Location: '/',
        },
    };
});
