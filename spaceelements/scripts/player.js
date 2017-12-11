/*
	Name: player.js 
	Author: Nick Greenquist
	Last Modified: 3/13/14
	Description: Singleton object representing player 
	Dependencies: uses global variables: images,keydown,KEYBOARD 
*/

"use strict";
window.player = (function(){
			var player={
				color:"red",
				direction: "straight",
				x:320,
				y:420,
				width:50,
				height:30,
				speed:300,
				playerSpriteX :16,
				playerSpriteY : 506,
				playerSpriteW : 36,
				playerSpriteH : 22,
				isHit : false,
				explosionTimer : 0,
				explosionMaxTime : 80,
				redUpgrade : true,
				greenUpgrade : true,
				blueUpgrade : true,
				
				
				explode: function() {
					console.log("Player was hit");
					this.isHit = true;
				},
				
				draw:function(ctx) { //relies on global ctx variable
					var halfW = this.width/2;
					var halfH = this.height/2;
					
					//explosion stuff
					if(this.isHit)
					{
						this.explosionTimer++;
						if(this.explosionTimer < this.explosionMaxTime)
						{
							var sourceWidth = 0;
							var sourceHeight = 0;
							if(this.explosionTimer > 0 && this.explosionTimer <= 5) { sourceWidth = 0; }
							if(this.explosionTimer > 5 && this.explosionTimer <= 10) { sourceWidth = 1; }
							if(this.explosionTimer > 10 && this.explosionTimer <= 15) { sourceWidth = 2; }
							if(this.explosionTimer > 15 && this.explosionTimer <= 20) { sourceWidth = 3; }
							if(this.explosionTimer > 20 && this.explosionTimer <= 25) { sourceWidth = 4; }
							if(this.explosionTimer > 25 && this.explosionTimer <= 30) { sourceWidth = 5; }
							if(this.explosionTimer > 30 && this.explosionTimer <= 35) { sourceWidth = 6; }
							if(this.explosionTimer > 35 && this.explosionTimer <= 40) { sourceWidth = 7; }
							if(this.explosionTimer > 40 && this.explosionTimer <= 45) { sourceWidth = 0; sourceHeight = 1; }
							if(this.explosionTimer > 45 && this.explosionTimer <= 50) { sourceWidth = 1; sourceHeight = 1;}
							if(this.explosionTimer > 50 && this.explosionTimer <= 55) { sourceWidth = 2; sourceHeight = 1;}
							if(this.explosionTimer > 55 && this.explosionTimer <= 60) { sourceWidth = 3; sourceHeight = 1;}
							if(this.explosionTimer > 60 && this.explosionTimer <= 65) { sourceWidth = 4; sourceHeight = 1;}
							if(this.explosionTimer > 65 && this.explosionTimer <= 70) { sourceWidth = 5; sourceHeight = 1;}
							if(this.explosionTimer > 70 && this.explosionTimer <= 75) { sourceWidth = 6; sourceHeight = 1;}
							if(this.explosionTimer > 75 && this.explosionTimer <= 80) { sourceWidth = 7; sourceHeight = 1;}
							ctx.drawImage(images["explosion"],sourceWidth * 128,sourceHeight * 128,128, 128, this.x - 15 ,this.y - 25,this.width + 30,this.height + 50);
						}
						else
						{
							this.explosionTimer = 0;
							this.isHit = false;
							this.x = (CANVAS_WIDTH / 2) - 50;
							this.y = (CANVAS_HEIGHT- this.height);
						}
					}
					
					else if(this.color == "red") {
						if(this.direction == "left") {
							ctx.drawImage(images["playerImageRedLeft"],this.x,this.y,this.width,this.height);
						}
						else if(this.direction == "right") {
							ctx.drawImage(images["playerImageRedRight"],this.x,this.y,this.width,this.height);
						}
						else {
							ctx.drawImage(images["playerImageRed"],this.x,this.y,this.width,this.height);
						}
					}
					else if(this.color == "green") {
						if(this.direction == "left") {
							ctx.drawImage(images["playerImageGreenLeft"],this.x,this.y,this.width,this.height);
						}
						else if(this.direction == "right") {
							ctx.drawImage(images["playerImageGreenRight"],this.x,this.y,this.width,this.height);
						}
						else {
							ctx.drawImage(images["playerImageGreen"],this.x,this.y,this.width,this.height);
						}
					}
					else if(this.color == "blue") {
						if(this.direction == "left") {
							ctx.drawImage(images["playerImageBlueLeft"],this.x,this.y,this.width,this.height);
						}
						else if(this.direction == "right") {
							ctx.drawImage(images["playerImageBlueRight"],this.x,this.y,this.width,this.height);
						}
						else {
							ctx.drawImage(images["playerImageBlue"],this.x,this.y,this.width,this.height);
						}
					}
		
					
					//add flames!
					if(lives < 3)
					{
						if(!this.isHit) {
							this.showExhaust(ctx);
						}
					}
					
				}, //end of draw function
				
				initParticle:function(p) {
					var halfW = this.width / 2;
					
					//getRandom(min,max) from utils.js
					p.x = getRandom(-halfW,halfW);
					p.y = getRandom(0,this.height);
					p.r = getRandom(2,4); //radius
					p.c = getRandom(2,4);
					p.xSpeed = getRandom(-0.5,0.5);
					p.ySpeed = getRandom(1,2);
					return p;
				}, //end initParticle()
				
				createParticles: function() {
					//initialize particle array
					this.particles = [];
					
					//create 20 exhaust particles
					for(var i = 0; i < 20; i++)
					{
						//create an "empty" particle object
						var p = {};
						
						//give it a random age when first created
						p.age = getRandomInt(0,99);
						
						//add to array
						this.particles.push(this.initParticle(p));
					} //end for
					
					//log the particles
					console.log(this.particles);
				}, //end createParticles()
				
				showExhaust:function showExhaust(ctx) {
					var halfW = this.width/2;
					var halfH = this.height/2;
					
					//if necessary - create particles
					if(!this.particles) this.createParticles();
					
					//move and draw particles
					//each frame, loop through this.particles array
					//move each particle down screen, and slightly left or right
					//make it bigger, and fade it out
					//increase its age so we know when to recycle it
					
					for(var i = 0; i<this.particles.length; i++)
					{
						var p = this.particles[i];
						
						p.age += 2.5;
						p.r  += .5;
						p.c += .3;
						p.x += p.xSpeed;
						p.y += p.ySpeed;
						var alpha = 1 - p.age / 100;
						
						//set fill color
						
						
						
						
						
						//fill circle instead
						ctx.fillStyle = "rgba(255,140,0," + alpha + ")";
						ctx.beginPath();
						ctx.arc(p.x + this.x + halfW, p.y + this.y + halfH, p.c/lives, Math.PI * 2, false);
						ctx.closePath();
						ctx.fill();
						ctx.fillStyle = "rgba(0,0,0," + alpha + ")";
						//fill a square
						ctx.fillRect(	p.x + this.x,
										p.y + this.y + halfH,
										p.r/lives,
										p.r/lives
						);
						
						//if the particle is too old, recycle it
						if(p.age * lives >= 100)
						{
							p.age = 0;
							this.initParticle(p);
						}	
					} //end for loop of this.particles
					
				} //end showExhaust()
				
			} //end of player object
	
	return player;
})();