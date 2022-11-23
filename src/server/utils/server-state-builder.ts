import { Session } from 'ydb-sdk';
import {
    GameConfig, PlayerState, RectCoords, ServerState,
} from '../../common/types';
import { User } from '../db/entity/user';
import { GridCell } from '../db/entity/grid-cell';
import { logger } from '../../common/logger';
import { getGameConfig } from './get-game-config';
import { isPlayerActive } from './is-player-active';
import { SCORE_FOR_CELL } from './constants';

export class ServerStateBuilder {
    private readonly createdTime: number;

    private constructor(
        private dbSess: Session,
        private config: GameConfig,
        private users: User[],
        private gridCells: GridCell[],
    ) {
        this.createdTime = Date.now();
    }

    static async create(dbSess: Session, gridAreas?: RectCoords[]) {
        const gameConfig = await getGameConfig(dbSess);
        const { worldGridSize } = gameConfig;
        const areas = gridAreas ?? [
            [
                [0, 0],
                [worldGridSize[0] - 1, worldGridSize[1] - 1],
            ],
        ];
        const users = await User.all(dbSess);
        const gridCells = await GridCell.allWithinAreas(dbSess, areas);

        return new ServerStateBuilder(dbSess, gameConfig, users, gridCells);
    }

    static userToPlayerState(user: User): PlayerState {
        return {
            id: user.id,
            name: user.tgUsername,
            // select smallest possible size of avatar
            avatar: user.tgAvatar?.replace('/320/', '/160/'),
            color: user.color,
            state: user.state,
            gridX: user.gridX,
            gridY: user.gridY,
            imageType: user.imageType,
            score: SCORE_FOR_CELL * user.cellsCount,
        };
    }

    buildMe(meId: string): ServerState['me'] {
        const me = this.users.find((u) => u.id === meId);

        if (!me) {
            throw new Error(`Unable to find me in DB: ${meId}`);
        }

        return ServerStateBuilder.userToPlayerState(me);
    }

    buildGrid(): ServerState['grid'] {
        const gridCellsState: ServerState['grid'] = {};

        for (const cell of this.gridCells) {
            const owner = this.users.find((u) => { return u.id === cell.ownerId; });

            if (owner) {
                if (!gridCellsState[cell.x]) {
                    gridCellsState[cell.x] = {};
                }

                gridCellsState[cell.x][cell.y] = {
                    ownerColor: owner.color,
                };
            } else {
                logger.error(`Unable to find owner for cell ${cell.x}:${cell.y}`);
            }
        }

        return gridCellsState;
    }

    buildPlayers(meId: string): ServerState['players'] {
        const playersState: ServerState['players'] = [];
        const activeEnemies = this.users.filter((u) => {
            return u.id !== meId && isPlayerActive(this.config, u);
        });

        for (const p of activeEnemies) {
            playersState.push(ServerStateBuilder.userToPlayerState(p));
        }

        return playersState;
    }

    buildStats(): ServerState['stats'] {
        return {
            topPlayers: this.users
                .map((u) => ServerStateBuilder.userToPlayerState(u))
                .sort((a, b) => b.score - a.score)
                .slice(0, 15),
        };
    }

    buildState(meId: string, withStats = false): ServerState {
        return {
            players: this.buildPlayers(meId),
            grid: this.buildGrid(),
            me: this.buildMe(meId),
            stats: withStats ? this.buildStats() : {},
            time: this.createdTime,
        };
    }
}
