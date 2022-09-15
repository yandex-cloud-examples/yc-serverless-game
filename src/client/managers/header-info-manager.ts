import * as phaser from 'phaser';
import { autorun } from 'mobx';
import { bind } from 'bind-decorator';
import { render } from 'preact';
import { html } from 'htm/preact';

import { GameState } from '../state/game-state';
import defaultAvatarImage from '../assets/images/default-avatar.png';

interface HeaderProps {
    avatarUrl: string;
    score: number;
    online: number;
}

const Header = (props: HeaderProps) => {
    return html`
      <div class="header-container">
          <div class="header-score">
              <div class="header-title">Очки</div>
              <div>${props.score}</div>
          </div>
          <div class="header-avatar">
              <img src="${props.avatarUrl}" />
          </div>
          <div class="header-online">
              <div class="header-title">Онлайн</div>
              <div>${props.online}</div>
          </div>
      </div>
    `;
};

export class HeaderInfoManager {
    private readonly containerEl: Element;

    constructor(
        private readonly gameState: GameState,
        private scene: phaser.Scene,
        containerSelector: string,
    ) {
        const element = document.querySelector(containerSelector);

        if (!element) {
            throw new Error(`Header container was not found in DOM by given selector: ${containerSelector}`);
        }

        this.containerEl = element;

        autorun(this.updateHeader);
    }

    @bind
    updateHeader() {
        const me = this.gameState.me;
        const avatarUrl = me.avatar || defaultAvatarImage;
        const online = this.gameState.players.length + 1;

        render(Header({
            avatarUrl,
            score: me.score,
            online,
        }), this.containerEl);
    }
}
