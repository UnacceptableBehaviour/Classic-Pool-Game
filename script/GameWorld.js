"use strict";

function GameWorld() {

    this.whiteBallStartingPosition = new Vector2(413,413);

    // layout normal triangle w/ 4 extra balls behind it
    // and 3 more behine that - adding 7 extra balls for player 3
    // lay ball in alternating colors
    // x = 34 / col
    // y = 40 / ball
    
    // 1  2    3       4           5            4         3
    //   ---       --------                -----------
    // 1 3 2 4 5 6 10 9 8 7 11 12 13 14 15 19 18 17 16 20 21 22
    // Y R B Y K R B  Y R B Y  R  B  Y  R  B  Y  R  B  Y  R  B  
    
    this.redBalls = [
    new Ball(new Vector2(1016,433),Color.red),// 3 - 1056,433
    new Ball(new Vector2(1050,452),Color.red),// 6 - 1090,452
    new Ball(new Vector2(1086,393),Color.red),// 8 - 1126,393
    new Ball(new Vector2(1122,374),Color.red),//12 - 1162,374
    new Ball(new Vector2(1122,491),Color.red),//15 - 1162,491
    new Ball(new Vector2(1162,393),Color.red),//17 - 1202,393
    new Ball(new Vector2(1202,413),Color.red) //21 - 1242,413
    ]

    this.yellowBalls = [
    new Ball(new Vector2( 982,413),Color.yellow),// 1 - 1022,413
    new Ball(new Vector2(1086,433),Color.yellow),// 9 - 1126,433
    new Ball(new Vector2(1050,374),Color.yellow),// 4 - 1090,374
    new Ball(new Vector2(1122,335),Color.yellow),//11 - 1162,335
    new Ball(new Vector2(1122,452),Color.yellow),//14 - 1162,452
    new Ball(new Vector2(1162,433),Color.yellow),//18 - 1202,433
    new Ball(new Vector2(1202,374),Color.yellow) //20 - 1242,374
    ];
    
    this.blueBalls = [
    new Ball(new Vector2(1016,393),Color.blue),// 2 - 1056,393
    new Ball(new Vector2(1086,354),Color.blue),// 7 - 1126,354   
    new Ball(new Vector2(1086,472),Color.blue),//10 - 1126,472  
    new Ball(new Vector2(1122,413),Color.blue),//13 - 1162,413  
    new Ball(new Vector2(1162,354),Color.blue),//16 - 1202,354  
    new Ball(new Vector2(1162,472),Color.blue),//19 - 1202,472  
    new Ball(new Vector2(1202,452),Color.blue),//22 - 1242,452
    ];

    
    
    this.whiteBall = new Ball(new Vector2(413,413),Color.white);
    this.blackBall = new Ball(new Vector2(1050,413),Color.black);

    this.balls = [
    this.yellowBalls[0],
    this.yellowBalls[1],
    this.redBalls[0],
    this.redBalls[1],
    this.blackBall,
    this.yellowBalls[2],
    this.yellowBalls[3],
    this.redBalls[2],
    this.yellowBalls[4],
    this.redBalls[3],
    this.redBalls[4],
    this.redBalls[5],
    this.yellowBalls[5],
    this.redBalls[6],
    this.yellowBalls[6],
    this.blueBalls[0],
    this.blueBalls[1],
    this.blueBalls[2],
    this.blueBalls[3],
    this.blueBalls[4],
    this.blueBalls[5],
    this.blueBalls[6],
    this.whiteBall]

    this.stick = new Stick({ x : 413, y : 413 });

    this.gameOver = false;
}

GameWorld.prototype.getBallsSetByColor = function(color){

    if(color === Color.red){
        return this.redBalls;
    }
    if(color === Color.yellow){
        return this.yellowBalls;
    }
    if(color === Color.white){
        return this.whiteBall;
    }
    if(color === Color.black){
        return this.blackBall;
    }
}

GameWorld.prototype.handleInput = function (delta) {
    this.stick.handleInput(delta);
};

GameWorld.prototype.update = function (delta) {
    this.stick.update(delta);

    for (var i = 0 ; i < this.balls.length; i++){
        for(var j = i + 1 ; j < this.balls.length ; j++){
            this.handleCollision(this.balls[i], this.balls[j], delta);
        }
    }

    for (var i = 0 ; i < this.balls.length; i++) {
        this.balls[i].update(delta);
    }

    if(!this.ballsMoving() && AI.finishedSession){
        Game.policy.updateTurnOutcome();
        if(Game.policy.foul){
            this.ballInHand();
        }
    }

};

GameWorld.prototype.ballInHand = function(){
    if(AI_ON && Game.policy.turn === AI_PLAYER_NUM){
        return;
    }

    KEYBOARD_INPUT_ON = false;
    this.stick.visible = false;
    if(!Mouse.left.down){
        this.whiteBall.position = Mouse.position;
    }
    else{
        let ballsOverlap = this.whiteBallOverlapsBalls();

        if(!Game.policy.isOutsideBorder(Mouse.position,this.whiteBall.origin) &&
            !Game.policy.isInsideHole(Mouse.position) &&
            !ballsOverlap){
            KEYBOARD_INPUT_ON = true;
            Keyboard.reset();
            Mouse.reset();
            this.whiteBall.position = Mouse.position;
            this.whiteBall.inHole = false;
            Game.policy.foul = false;
            this.stick.position = this.whiteBall.position;
            this.stick.visible = true;
        }
    }

}

GameWorld.prototype.whiteBallOverlapsBalls = function(){

    let ballsOverlap = false;
    for (var i = 0 ; i < this.balls.length; i++) {
        if(this.whiteBall !== this.balls[i]){
            if(this.whiteBall.position.distanceFrom(this.balls[i].position)<BALL_SIZE){
                ballsOverlap = true;
            }
        }
    }

    return ballsOverlap;
}

GameWorld.prototype.ballsMoving = function(){

    var ballsMoving = false;

    for (var i = 0 ; i < this.balls.length; i++) {
        if(this.balls[i].moving){
            ballsMoving = true;
        }
    }

    return ballsMoving;
}

GameWorld.prototype.handleCollision = function(ball1, ball2, delta){

    if(ball1.inHole || ball2.inHole)
        return;

    if(!ball1.moving && !ball2.moving)
        return;

    var ball1NewPos = ball1.position.add(ball1.velocity.multiply(delta));
    var ball2NewPos = ball2.position.add(ball2.velocity.multiply(delta));

    var dist = ball1NewPos.distanceFrom(ball2NewPos);

    if(dist<BALL_SIZE){
        Game.policy.checkColisionValidity(ball1, ball2);

        var power = (Math.abs(ball1.velocity.x) + Math.abs(ball1.velocity.y)) + 
                    (Math.abs(ball2.velocity.x) + Math.abs(ball2.velocity.y));
        power = power * 0.00482;

        if(Game.sound && SOUND_ON){
            var ballsCollide = sounds.ballsCollide.cloneNode(true);
            ballsCollide.volume = (power/(20))<1?(power/(20)):1;
            ballsCollide.play();
        }

        var opposite = ball1.position.y - ball2.position.y;
        var adjacent = ball1.position.x - ball2.position.x;
        var rotation = Math.atan2(opposite, adjacent);

        ball1.moving = true;
        ball2.moving = true;

        var velocity2 = new Vector2(90*Math.cos(rotation + Math.PI)*power,90*Math.sin(rotation + Math.PI)*power);
        ball2.velocity = ball2.velocity.addTo(velocity2);

        ball2.velocity.multiplyWith(0.97);

        var velocity1 = new Vector2(90*Math.cos(rotation)*power,90*Math.sin(rotation)*power);
        ball1.velocity = ball1.velocity.addTo(velocity1);

        ball1.velocity.multiplyWith(0.97);
    }

}

GameWorld.prototype.draw = function () {
    Canvas2D.drawImage(sprites.background);
    Game.policy.drawScores();

    for (var i = 0; i < this.balls.length; i++) {
        this.balls[i].draw();
    }

    this.stick.draw();
};

GameWorld.prototype.reset = function () {
    this.gameOver = false;

    for (var i = 0; i < this.balls.length; i++) {
        this.balls[i].reset();
    }

    this.stick.reset();

    if(AI_ON && AI_PLAYER_NUM === 0){
        AI.startSession();
    }
};

GameWorld.prototype.initiateState = function(balls){
    
    for (var i = 0; i < this.balls.length; i++) {
        this.balls[i].position.x = balls[i].position.x;
        this.balls[i].position.y = balls[i].position.y;
        this.balls[i].visible = balls[i].visible;
        this.balls[i].inHole = balls[i].inHole;
    }

    this.stick.position = this.whiteBall.position;
}

