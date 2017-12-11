"use strict";
window.Enemy = (function() {
	function Enemy(CANVAS_WIDTH,CANVAS_HEIGHT,color,speed,hpp) {
		//vars
		this.isSmall = false;
		this.active = true;
		this.color= color;
		this.age = Math.floor(Math.random() * 128);
		this.canvasHeight = CANVAS_HEIGHT;
		this.canvasWidth = CANVAS_WIDTH;
		this.hp = hpp;
		this.shooting = false;
		this.shotTimer = 90;
		this.counterShot = 0;
		this.boss = false;
		this.hitCounter = 0;
		this.hitCounterMax = 5;
		this.isHit = false;
		this.isExplode = false;
		this.isDead = false;
		this.direction = 1;
		this.explosionTimer = 0,
		this.explosionMaxTime = 40,
		this.x = this.canvasWidth / 4 + Math.random() * this.canvasWidth / 2;
		this.y = 0;
		this.xVelocity = 0;
		this.yVelocity = speed;
		this.amplitude = getRandom(1.5, 7.0);
		
		this.width = 40;
		this.height = 40;
		//color differences in constructor
		if(color == "red") {
			this.width = 40;
			this.height = 40;
		}
		if(color == "green")
		{
			this.width = 50;
			this.height = 44;
		}
		if(color == "blue")
		{
			this.width = 41;
			this.height = 64;
		}
	};
	
	//methods
	Enemy.prototype.inBounds = function() {
		return this.y >= 0 && this.y <= this.canvasHeight;
	};
	
	Enemy.prototype.draw = function(ctx) {
		var halfW = this.width/2;
		var halfH = this.height/2;
		//use this if your image has just one sprite
		//ctx.drawImage(images["enemyImage"],this.x-halfW,this.y-//halfH,this.width,this.height);
		
		//explosion stuff
		if(this.isExplode)
		{
			this.explosionTimer++;
			if(this.explosionTimer < this.explosionMaxTime)
			{
				if(this.color == "blue") { this.height = 40; this.width = 40; }
				var sourceWidth = 0;
				var sourceHeight = 0;
				if(this.explosionTimer > 0 && this.explosionTimer <= 3) { sourceWidth = 0; }
				if(this.explosionTimer > 3 && this.explosionTimer <= 5) { sourceWidth = 1; }
				if(this.explosionTimer > 5 && this.explosionTimer <= 8) { sourceWidth = 2; }
				if(this.explosionTimer > 8 && this.explosionTimer <= 10) { sourceWidth = 3; }
				if(this.explosionTimer > 10 && this.explosionTimer <= 13) { sourceWidth = 4; }
				if(this.explosionTimer > 13 && this.explosionTimer <= 15) { sourceWidth = 5; }
				if(this.explosionTimer > 15 && this.explosionTimer <= 17) { sourceWidth = 6; }
				if(this.explosionTimer > 17 && this.explosionTimer <= 20) { sourceWidth = 7; }
				if(this.explosionTimer > 20 && this.explosionTimer <= 23) { sourceWidth = 0; sourceHeight = 1; }
				if(this.explosionTimer > 23 && this.explosionTimer <= 25) { sourceWidth = 1; sourceHeight = 1;}
				if(this.explosionTimer > 25 && this.explosionTimer <= 27) { sourceWidth = 2; sourceHeight = 1;}
				if(this.explosionTimer > 27 && this.explosionTimer <= 30) { sourceWidth = 3; sourceHeight = 1;}
				if(this.explosionTimer > 30 && this.explosionTimer <= 32) { sourceWidth = 4; sourceHeight = 1;}
				if(this.explosionTimer > 32 && this.explosionTimer <= 35) { sourceWidth = 5; sourceHeight = 1;}
				if(this.explosionTimer > 35 && this.explosionTimer <= 37) { sourceWidth = 6; sourceHeight = 1;}
				if(this.explosionTimer > 37 && this.explosionTimer <= 40) { sourceWidth = 7; sourceHeight = 1;}
				ctx.drawImage(images["explosion"],sourceWidth * 128,sourceHeight * 128,128, 128, this.x,this.y,this.width,this.height);
			}
			else
			{
				this.explosionTimer = 0;
				this.isDead = true;
				this.x = (CANVAS_WIDTH / 2) - 50;
				this.y = (CANVAS_HEIGHT- this.height);
			}
		}
		
		//draw from a sprite sheet
		else if(this.color == "red") {
			if(this.isHit)
			{
				ctx.drawImage(images["redEnemyImageHit"], this.x,this.y,this.width,this.height);
			}
			else {
				ctx.drawImage(images["redEnemyImage"], this.x,this.y,this.width,this.height);
			}
		}
		else if(this.color == "green") {
			if(this.isHit)
			{
				ctx.drawImage(images["greenEnemyImageHit"], this.x,this.y,this.width,this.height);
			}
			else {
				ctx.drawImage(images["greenEnemyImage"], this.x,this.y,this.width,this.height);
			}
		}
		else if(this.color == "blue") {
			
			if(this.isHit)
			{
				if(this.direction == -1){
					ctx.drawImage(images["blueEnemyImageHL"], this.x,this.y,this.width,this.height);
				}
				else if( this.direction == 1){
					ctx.drawImage(images["blueEnemyImageHR"], this.x,this.y,this.width,this.height);
				}
				else{
					ctx.drawImage(images["blueEnemyImageH"], this.x,this.y,this.width,this.height);
				}
			}
			else{
				if(this.direction == -1){
					ctx.drawImage(images["blueEnemyImageL"], this.x,this.y,this.width,this.height);
				}
				else if( this.direction == 1){
					ctx.drawImage(images["blueEnemyImageR"], this.x,this.y,this.width,this.height);
				}
				else{
					ctx.drawImage(images["blueEnemyImage"], this.x,this.y,this.width,this.height);
				}
			}
		}
		else if(this.boss == true) {
			if(this.isHit)
			{
				ctx.drawImage(images["bossHit"], this.x,this.y,this.width,this.height);
			}
			else {
				ctx.drawImage(images["boss"], this.x,this.y,this.width,this.height);
			}
		}
		else {
			if(this.isHit)
			{
				ctx.drawImage(images["enemyImageHit"], this.x,this.y,this.width,this.height);
			}
			else {
				ctx.drawImage(images["enemyImage"], this.x,this.y,this.width,this.height);
			}
		}
	};
	
	//update the enemy based on the color
	Enemy.prototype.update = function(dt,playaX) {
		if(this.boss && this.hp <= 0 && !this.isExplode) { bossActive = false; dropUpgrade = true; lives++; }
		if(this.hp <= 0) { this.isExplode = true; }
		if(this.color == "blue") {
			var setSpeed = 2;
			this.xVelocity = setSpeed;
 
			this.direction = playaX - this.x;
 
			if(this.direction < -20){ this.direction = -1;}
			else if(this.direction > 20) { this.direction = 1; }
			else if(this.direction < 20 && this.direction > -20) { this.direction = .01; }
			
			if(!this.isExplode && !this.isDead) {
				this.x += this.xVelocity * this.direction; 
				this.y += this.yVelocity *dt; 
			}
			//this.age++; 
			this.active = this.active && this.inBounds() && !this.isDead; //health
		}
		if(this.color == "green") {
			this.shootP();
			this.xVelocity = this.amplitude * Math.sin(this.age * Math.PI * dt);
			if(!this.isExplode && !this.isDead) {
				this.x += this.xVelocity;
				this.y += this.yVelocity * dt;
			}
			this.age++;
			this.active = this.active && this.inBounds() && !this.isDead;
		}
		else {
			this.xVelocity = this.amplitude * Math.sin(this.age * Math.PI * dt);
			if(!this.isExplode && !this.isDead) {
				this.x += this.xVelocity;
				this.y += this.yVelocity * dt;
			}
			this.age++;
			this.active = this.active && this.inBounds() && !this.isDead;
		}
		//boss doesn't move down
		if(this.boss && this.y > this.height + 10)
		{
			this.y = this.height + 10;
		}
		//boss shooting
		if(this.boss)
		{
			this.shootP();
		}
		
		if(this.isHit)
		{
			this.hitCounter++;
			if(this.hitCounter > 2)
			{
				this.hitCounter = 0;
				this.isHit = false;
			}
		}
	};
	
	//if the enemy is a boss, set bossActive to false
	Enemy.prototype.explode = function() {
		if(this.boss == true) { bossActive = false; }
	};
	
	Enemy.prototype.alive = function(){  //health
		return this.hp >0;
	}//end of lose hp
	
	//lose hp if bullet is correct color
	Enemy.prototype.loseHP = function(bullet){
		if(this.color == "red"){
			if(bullet.color == "red"){
				this.hp--;
			}
		}
		else if(this.color == "blue"){
			if(bullet.color == "blue"){
				this.hp--;
			}
		}
		else if(this.color == "green"){
			if(bullet.color == "green"){
				this.hp--;
			}
		}
		else{
			this.hp--;
		}
 
	}//end of lose hp
 
	Enemy.prototype.shootP = function(){
		this.counterShot++;
		if(this.counterShot >=this.shotTimer){
			this.counterShot = 0;
			this.shooting = true;
		}
		else
			this.shooting = false;
}

	
	return Enemy;
})();