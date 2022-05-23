class SceneMain extends Phaser.Scene {

    constructor() {
        super('SceneMain');
        this.paddleSpeed = 8;
        this.paddleWidth = 20;
        this.paddleHeight = 100;
        this.ballSize = 25;
        this.ballIsMovingUp = false;
        this.compScore = 0;
        this.userScore = 0;
        this.level = 4;
        this.playing = true;
    }

    preload() {
        this.load.audio("beep", [
            "audio/beep.mp3",
            "audio/beep.ogg"
        ]);
        this.load.audio("score", [
            "audio/fupicat.mp3",
            "audio/fupicat.ogg"
        ]);
    }

    create() {

        this.beepSound = this.sound.add("beep");
        this.scoreSound = this.sound.add("score");

        // create the abilty to use the cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();

        this.drawFieldDividingDots();

        // create computer paddle
        this.compPaddle = this.add.graphics();
        this.compPaddle.fillStyle(0xffffff);
        this.compPaddle.fillRect(0, 0, this.paddleWidth, this.paddleHeight);
        this.compPaddle.x = this.paddleWidth / 2;
        this.compPaddle.y = game.config.height / 2 - this.paddleHeight / 2;

        // create user paddle
        this.userPaddle = this.add.graphics();
        this.userPaddle.fillStyle(0xffffff);
        this.userPaddle.fillRect(0, 0, this.paddleWidth, this.paddleHeight);

        /*
        It might seem odd that I am calling fillRect() with the coordinates (0,0)
        and then immediately changing these coordinates. However: this is a way
        to make sure that when you ask for the x and y value later on (when checking
        for collission f.i.), you will get the absolute x and y values, instead
        of relative to the position where you first drew the paddle.
        */

        this.userPaddle.x = game.config.width - this.paddleWidth / 2 * 3;
        this.userPaddle.y = game.config.height / 2 - this.paddleHeight / 2;

        this.createNewBall();

        this.drawScoreBoards();

    }

    update() {
        if (this.playing) {
            this.moveUserPaddle();
            this.moveCompPaddle();
            this.moveBall();
            this.checkPaddleCollission();
            this.checkWallCollission();
            this.score();
        }
    }

    checkPaddleCollission() {
        // Calculate paddle edges for collission
        this.userPaddle.topY = this.userPaddle.y;
        this.userPaddle.bottomY = this.userPaddle.y + this.paddleHeight;
        this.compPaddle.topY = this.compPaddle.y;
        this.compPaddle.bottomY = this.compPaddle.y + this.paddleHeight;
        var distanceFromCenter = 0.7 * 0.5 * this.paddleHeight;

        if (
            // If the ball's right edge is t the paddles left edge
            this.ball.x + this.ballSize >= this.userPaddle.x &&
            // ...and the ball's bottom edge is lower than the paddles top edge
            this.ball.y + this.ballSize >= this.userPaddle.topY &&
            // ...and the ball's top edge is higher than the paddles bottom edge
            this.ball.y <= this.userPaddle.bottomY
        ) {
            this.beepSound.play();
            this.ball.x = this.userPaddle.x - this.ballSize;

            // Change ball speeds
            var ballTop = this.ball.y;
            var ballBottom = this.ball.y + this.ballSize;
            var ballCenter = (ballTop + ballBottom) / 2;
            var paddleTop = this.userPaddle.y;
            var paddleBottom = this.userPaddle.y + this.paddleHeight;
            var paddleCenter = (paddleTop + paddleBottom) / 2;

            if (paddleCenter - ballCenter >= distanceFromCenter) {
                this.ballYSpeed = -5;
                this.ballXSpeed = -25;
                console.log("BOVENHOEK");
            }
            if (ballCenter - paddleCenter >= distanceFromCenter) {
                this.ballYSpeed = 5;
                this.ballXSpeed = -25;
                console.log("ONDERHOEK");
            }
            if (paddleCenter - ballCenter < distanceFromCenter && paddleCenter - ballCenter > 0) {
                this.ballYSpeed = -1;
                this.ballXSpeed = -8;
                console.log("BOVENCENTRUM");
            }
            if (ballCenter - paddleCenter < distanceFromCenter && ballCenter - paddleCenter > 0) {
                this.ballYSpeed = 1;
                this.ballXSpeed = -8;
                console.log("ONDERCENTRUM");
            }
            if (paddleCenter - ballCenter == 0) {
                this.ballYSpeed = 0;
                this.ballXSpeed = -30;
                console.log("SMASH!");
            }



        }
        if (
            // If the ball is moving left...
            this.ballXSpeed < 0 &&
            // ...and the ball's left edge is more left than the paddles right edge
            this.ball.x <= this.compPaddle.x + this.paddleWidth &&
            // ...and the ball's bottom edge is lower than the paddles top edge
            this.ball.y + this.ballSize >= this.compPaddle.topY &&
            // ...and the ball's top edge is higher than the paddles bottom edge
            this.ball.y <= this.compPaddle.bottomY
        ) {
            // this.ball.x = this.compPaddle.x + this.ballSize;
            this.beepSound.play();
            this.ballXSpeed *= -1;

            // Change ball speeds
            var ballTop = this.ball.y;
            var ballBottom = this.ball.y + this.ballSize;
            var ballCenter = (ballTop + ballBottom) / 2;
            var paddleTop = this.compPaddle.y;
            var paddleBottom = this.compPaddle.y + this.paddleHeight;
            var paddleCenter = (paddleTop + paddleBottom) / 2;

            if (Math.abs(paddleCenter - ballCenter) > 0.8 * this.paddleHeight) {
                this.ballYSpeed = 8;
            } else {
                this.ballYSpeed *= 1;
            }
        }

    }

    checkWallCollission() {
        if (
            // If ball's bottom edge is touching the screen's bottom edge
            this.ball.y + this.ballSize >= game.config.height ||
            // ...or the ball's top edge is touching the screen's upper edge
            this.ball.y <= 0
        ) {
            this.ballYSpeed *= -1;
            this.ballIsMovingUp ? this.ballIsMovingUp = false : this.ballIsMovingUp = true;
        }
    }

    createNewBall() {
        if (this.userScore + this.compScore < 10) {
            this.ballYSpeed = 1;
            this.ballXSpeed = -6;
            this.ball = this.add.graphics();
            this.ball.fillStyle(0xffdd00);
            this.ball.fillRect(0, 0, this.ballSize, this.ballSize);
            this.ball.x = game.config.width / 2 - this.paddleWidth / 2;
            this.ball.y = game.config.height / 2 - this.ballSize / 2;
            this.ball.movingRight = true;
            this.ballXSpeed *= -1;
        } else {
            this.playing = false;
        }
    }

    drawFieldDividingDots() {
        var dotWidth = 10;
        var dotHeight = 25;
        var dotAmount = game.config.height / (2 * dotHeight);
        for (var i = 0; i < dotAmount; i++) {
            var dot = this.add.graphics();
            dot.fillStyle(0xffffff);
            dot.fillRect(game.config.width / 2 - dotWidth / 2, 2 * dotHeight * i, dotWidth, dotHeight);
        }
    }

    drawScoreBoards() {
        var font = {
            fontFamily: "sans-serif",
            fontSize: 40,
            color: "white"
        }
        this.compScoreBoard = this.add.text(game.config.width / 2 - 100, 20, this.compScore, font);
        this.userScoreBoard = this.add.text(game.config.width / 2 + 100, 20, this.userScore, font);
    }

    moveBall() {
        this.ball.x += this.ballXSpeed;
        this.ball.y += this.ballYSpeed;
    }

    moveCompPaddle() {
        if (this.compPaddle.topY >= 0 && (this.ball.y + this.ballSize / 2) - (this.compPaddle.y + this.paddleHeight / 2) < 0 && this.ball.x < game.config.width / 10 * this.level) {
            this.compPaddle.y -= this.paddleSpeed;
        }
        if (this.compPaddle.bottomY <= game.config.height && (this.ball.y + this.ballSize / 2) - (this.compPaddle.y + this.paddleHeight / 2 ) > 0 && this.ball.x < game.config.width / 10 * this.level) {
            this.compPaddle.y += this.paddleSpeed;
        }
    }

    moveUserPaddle() {
        if (this.cursors.up.isDown && this.userPaddle.topY > 0) {
            this.userPaddle.y -= this.paddleSpeed;
        }
        if (this.cursors.down.isDown && this.userPaddle.bottomY < game.config.height) {
            this.userPaddle.y += this.paddleSpeed;
        }
    }

    score() {
        if (this.ball.x > game.config.width) {
            this.compScore++;
        }
        if (this.ball.x + this.ballSize < 0) {

            this.userScore++;
            this.level += 0.5;
        }
        if (this.ball.x > game.config.width || this.ball.x + this.ballSize < 0) {
            this.scoreSound.play();
            this.compScoreBoard.destroy();
            this.userScoreBoard.destroy();
            this.drawScoreBoards();
            this.createNewBall();
        }
    }

}