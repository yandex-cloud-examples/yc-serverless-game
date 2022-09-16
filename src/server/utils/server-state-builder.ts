import { Session } from 'ydb-sdk';
import { GameConfig, PlayerState, ServerState } from '../../common/types';
import { User } from '../db/entity/user';
import { GridCell } from '../db/entity/grid-cell';
import { logger } from '../../common/logger';
import { getGameConfig } from './get-game-config';
import { isPlayerActive } from './is-player-active';

export class ServerStateBuilder {
    private constructor(
        private dbSess: Session,
        private config: GameConfig,
        private users: User[],
        private gridCells: GridCell[],
    ) {}

    static async create(dbSess: Session) {
        const users = await User.all(dbSess);
        const gridCells = await GridCell.all(dbSess);
        const gameConfig = await getGameConfig(dbSess);

        return new ServerStateBuilder(dbSess, gameConfig, users, gridCells);
    }

    static userToPlayerState(user: User, gridCells: GridCell[]): PlayerState {
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
            score: user.calculateScore(gridCells),
        };
    }

    buildMe(meId: string): ServerState['me'] {
        const me = this.users.find((u) => u.id === meId);

        if (!me) {
            throw new Error(`Unable to find me in DB: ${meId}`);
        }

        return ServerStateBuilder.userToPlayerState(me, this.gridCells);
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
            playersState.push(ServerStateBuilder.userToPlayerState(p, this.gridCells));
        }

        return playersState;
    }

    buildStats(): ServerState['stats'] {
        return {
            topPlayers: this.users
                .map((u) => ServerStateBuilder.userToPlayerState(u, this.gridCells))
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
            time: Date.now(),
        };
    }
}
