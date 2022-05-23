var game;

window.onload = function () {
    var config = {
        type: Phaser.AUTO,
        width: 1000,
        height: 600,
        parent: 'phaser-game',
        backgroundColor: Phaser.Display.Color.HexStringToColor("#000"),
        scene: [SceneMain, GameOver]
    }
    game = new Phaser.Game(config);
}