import { autorun } from 'mobx';
import { bind } from 'bind-decorator';
import { render, VNode } from 'preact';
import { html } from 'htm/preact';
import { GameState } from '../state/game-state';
import defaultAvatarImage from '../assets/images/default-avatar.png';

interface PlayerTopItemPros {
    index: number;
    avatarUrl: string;
    name: string;
    score: number;
    color: string;
}

const PlayerTopItem = (props: PlayerTopItemPros) => {
    return html`
      <div class="players-top-item">
          <div class="players-top-item-num">${props.index}</div>
          <div class="players-top-item-avatar"><img src="${props.avatarUrl}" /></div>
          <div class="players-top-item-mid-container">
              <div class="players-top-item-login">${props.name}</div>
              <div class="players-top-item-score">${props.score}</div>
          </div>
          <div class="players-top-item-color-box" style="background-color: #${props.color}"></div>
      </div>
    `;
};

export class GameStatsManager {
    private readonly containerElement: HTMLElement;

    constructor(
        private readonly gameState: GameState,
        containerElementSelector: string,
    ) {
        const el = document.querySelector<HTMLElement>(containerElementSelector);

        if (!el) {
            throw new Error(`Parent element was not found in DOM by selector: ${containerElementSelector}`);
        }

        this.containerElement = el;

        autorun(this.updatePlayersStats);
    }

    @bind
    updatePlayersStats() {
        const topPlayers = this.gameState.stats.topPlayers;
        const playerTopItems: VNode[] = [];

        if (topPlayers) {
            for (const [i, player] of topPlayers.entries()) {
                const avatarUrl = player.avatar || defaultAvatarImage;
                const index = i + 1;

                playerTopItems.push(PlayerTopItem({
                    index,
                    avatarUrl,
                    name: player.name,
                    color: player.color,
                    score: player.score,
                }));
            }
        }

        render(playerTopItems, this.containerElement);
    }
}
