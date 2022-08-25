import { Session, TypedValues } from 'ydb-sdk';
import { GameConfig } from '../../common/types';
import { Config } from '../db/entity/config';

export const getGameConfig = async (dbSess: Session, name = 'default'): Promise<GameConfig> => {
    const query = await dbSess.prepareQuery(`
        DECLARE $name AS UTF8;
        SELECT * FROM Config WHERE name == $name LIMIT 1;
    `);
    const { resultSets } = await dbSess.executeQuery(query, {
        $name: TypedValues.utf8(name),
    });
    const configs = Config.fromResultSet(resultSets[0]);

    if (configs.length === 0) {
        throw new Error(`Game config with name '${name}' was not found in DB`);
    }

    const config = configs[0];

    return {
        playerSize: config.playerSize,
        gridCellSize: config.gridCellSize,
        worldGridSize: [config.worldSizeX, config.worldSizeY],
    };
};
