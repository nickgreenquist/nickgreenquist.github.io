/*
	Name: 			audio.js
	Author: 		Tony Jefferson
	Last Modified: 	3/23/2013
	Description: 	Quick and dirty audio playing script. Should be re-factored to 
	allow more simultaneous sound channels and the re-use of Audio() objects.
	Dependencies: 	requires HTML5 Audio() object
*/

"use strict";
window.audio = (function(){

	var AUDIO_CHANNEL = {
		CHANNEL_BACKGROUND: "channelBackground",
		CHANNEL_BULLET: "channelBullet",
		CHANNEL_EXPLOSION: "channelExplosion",
		CHANNEL_NONE: "channelNone"
	};

	var AUDIO_SOURCES = {
		AUDIO_BACKGROUND: "sounds/Carmack FadeEndm_0",
		AUDIO_BULLET: "sounds/shoot",
		AUDIO_ENEMY_EXPLOSION: "sounds/explosion",
	};
	
	var soundChannels = {};

	function AudioEffect(channel,trackURL,volume,loop){
		/* 
		Kill old channel if we want
		Probably a good idea if you don't like crashes
		*/
		if (soundChannels[channel]) soundChannels[channel].kill(); // kill old AudioEffect
			
		if(channel != AUDIO_CHANNEL.CHANNEL_NONE) soundChannels[channel] = this;
		this.myAudio = new Audio();
		if(this.myAudio.canPlayType("audio/mpeg")){
			trackURL += ".mp3";
		} else {
			trackURL += ".wav";
		}
		this.myAudio.src = trackURL;
		this.myAudio.volume = volume;
		if (loop) this.myAudio.loop = true;
		this.myAudio.play();
			
	}
		
	AudioEffect.prototype.kill = function(){
		if(this.myAudio){
			this.myAudio.pause();
			this.myAudio.src = "";
			this.myAudio = null;
		} 
	}
	// end AudioEffect
	
	function playBulletSound(volume){
		new AudioEffect(AUDIO_CHANNEL.CHANNEL_BULLET,AUDIO_SOURCES.AUDIO_BULLET,volume);
	}
	
	function playExplosionSound(volume){
		new AudioEffect(AUDIO_CHANNEL.CHANNEL_EXPLOSION,AUDIO_SOURCES.AUDIO_ENEMY_EXPLOSION,volume);
	}
	
	function playBackgroundSound(volume){
		new AudioEffect(AUDIO_CHANNEL.CHANNEL_BACKGROUND,AUDIO_SOURCES.AUDIO_BACKGROUND,volume,true);
	}
	
	// !! be cautious using playBulletSound2() !!
	// it allows unlimited number of new Audio objects to be created.
	// it will crash your browser if over-used
	// try cranking the fire rate up to 100 and calling it - you'll see
	function playBulletSound2(volume){
		new AudioEffect(AUDIO_CHANNEL.CHANNEL_NONE,AUDIO_SOURCES.AUDIO_BULLET,volume);
	}
	
	// These 4 functions are the public interface of this module
	// they can be accessed from the outside like this: audio.playBackgroundSound(0.5);
	return{
		playBulletSound : playBulletSound,
		playBulletSound2 : playBulletSound2,
		playExplosionSound : playExplosionSound,
		playBackgroundSound : playBackgroundSound
	};

})();