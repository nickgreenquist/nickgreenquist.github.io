/*
	Name: Bullet 
	Author: Nick Greenquist 
	Last Modified: 3/13/14
	Description: Function constructor that creates a Bullet 
	Dependencies: requires global variables: CANVAS_WIDTH,CANVAS_HEIGHT
*/


"use strict"
window.Bullet = (function(){
	function Bullet(x,y,speed,color){
		//ivars - unique for every instance
		this.x = x;
		this.y = y;
		this.active = true;
		this.xVelocity = 0;
		this.yVelocity = -speed;
		this.width = 5;
		this.height = 16;
		this.color = color;
	} //end Bullet Constructor
	
	//Bullet methods - all instances share one copt of each function
	//through .prototype
	
	Bullet.prototype.inBounds = function() {
		return this.x >= 0 && this.x <= CANVAS_WIDTH -100 &&
			this.y >= 0 && this.y <= CANVAS_HEIGHT;
	};
	
	Bullet.prototype.update = function(dt) {
		this.x += this.xVelocity * dt;
		this.y += this.yVelocity * dt;
		this.active = this.active && this.inBounds();
	}
	
	Bullet.prototype.draw = function(ctx) {
		ctx.fillStyle = this.color;
		ctx.strokeStyle = "white";
		//ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.width ,0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		
	}
	
	return Bullet; //return the Bullet constructor
})(); //self-executing anonymous function