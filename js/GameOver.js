class GameOver extends Phaser.Scene {

    constructor() {
        super('GameOver');

    }

    preload() {

    }

    create() {
        this.drawScoreBoards();
    }

    update() {

    }

    drawScoreBoards() {
        var font = {
            fontFamily: "sans-serif",
            fontSize: 40,
            color: "white"
        }
        this.compScoreBoard = this.add.text(game.config.width / 2 - 100, 20, "GAME OVER", font);
    }

}