
"use strict"
window.Upgrades = (function(){
	function Upgrades(x,y,speed,color){
		//ivars - unique for every instance
		this.x = x;
		this.y = y;
		this.active = true;
		this.xVelocity = 0;
		this.yVelocity = -speed;
		this.colorCounter = 0;
		this.width = 60;
		this.height = 60;
		
		this.color = color;
	} //end Upgrades Constructor
	
	
	//helper method to see if the upgrade is in bounds
	Upgrades.prototype.inBounds = function() {
		return this.x >= 0 && this.x <= CANVAS_WIDTH &&
			this.y >= 0 && this.y <= CANVAS_HEIGHT;
	};
	
	//update the upgrade
	Upgrades.prototype.update = function(dt) {
		this.x += this.xVelocity * dt;
		this.y += this.yVelocity * dt;
		this.active = this.active && this.inBounds();
		this.colorCounter++;
		
		if(this.colorCounter > 100){
			this.colorCounter = 0;
			if(this.color == "blue"){
				this.color = "red";
			}
			else if(this.color == "red"){
				this.color = "green";
			}
			else if(this.color == "green"){
				this.color = "blue";
			}
		}
		
	}
	
	//draw the upgrade
	Upgrades.prototype.draw = function(ctx) {
		ctx.fillStyle = this.color;
		ctx.strokeStyle = "white";
		//ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.beginPath();
		ctx.arc(this.x, this.y, 30 ,0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		
	}
	
	return Upgrades; //return the Upgrades constructor
})();