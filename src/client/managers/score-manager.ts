import * as phaser from 'phaser';
import { autorun } from 'mobx';
import { bind } from 'bind-decorator';
import { GameState } from '../state/game-state';

export class ScoreManager {
    private readonly scoreTextContainer: Element;

    constructor(
        private readonly gameState: GameState,
        private scene: phaser.Scene,
        private scoreTextContainerSelector: string,
    ) {
        const element = document.querySelector(scoreTextContainerSelector);

        if (!element) {
            throw new Error(`Score text container was not found in DOM by given selector: ${scoreTextContainerSelector}`);
        }

        this.scoreTextContainer = element;

        autorun(this.updateScore);
    }

    @bind
    updateScore() {
        const { score } = this.gameState.me;

        this.scoreTextContainer.textContent = `Score: ${score}`;
    }
}
