/*
SpliceVR Editor: A video editor for cinematic virtual reality
Copyright (C) 2015 Alex Meagher Grau

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
*/

(function(global) {
	SpliceVRFrame = function() {
		globalCanvas = document.getElementById('spliceCanvas');
		globalCanvas.width = window.innerWidth;
		globalCanvas.height = window.innerHeight;

		this.transY = 0.0;
		this.transX = 0.0;
		this.prevX = 0.0;
		this.prevY = 0.0;
		this.prevPixX = 0.0;
		this.prevPixY = 0.0;
		this.dragged = false;
		this.resized = true;
		this.cX = 0;
		this.cY = 0;
		this.rect = globalCanvas.getBoundingClientRect();
		this.mode = 0;
		this.touch = 0;
		this.zoom = 0.0;
		
		this.pixelScale = 1000;
		this.scaleX =  this.pixelScale/(1.0*globalCanvas.width);
		this.scaleY =  this.pixelScale/(1.0*globalCanvas.height);
		this.hudPixelScale = 1000;
		this.hudScaleX =  this.hudPixelScale/(1.0*globalCanvas.width);
		this.hudScaleY =  this.hudPixelScale/(1.0*globalCanvas.height);
	};
	SpliceVRFrame.prototype.pointEvent = function(e, m, t){
		this.mode = m;
		this.touch = t;
		if(this.touch == 0){
			this.cX = e.clientX;
			this.cY = e.clientY;
		}
		else if(this.mode != 3){
			this.cX =e.touches[0].clientX;
			this.cY =e.touches[0].clientY;
		}
		else{
			this.cX = this.prevX;
			this.cY = this.prevY;
		}
		this.rect = globalCanvas.getBoundingClientRect();
		this.pixX = (this.cX-this.rect.left)-globalCanvas.width/2.0;
		this.pixY = -((this.cY-this.rect.top)-globalCanvas.height/2.0);
		this.hudX = (this.pixX)/(this.hudScaleX*globalCanvas.width*0.5);
		this.hudY = (this.pixY)/(this.hudScaleY*globalCanvas.height*0.5);
		this.adjX = (-this.zoom+1)*(this.pixX)/(this.scaleX*globalCanvas.width*0.5)+this.transX;
		this.adjY = (-this.zoom+1)*(this.pixY)/(this.scaleY*globalCanvas.height*0.5)+this.transY;
		
	};
	SpliceVRFrame.prototype.update = function(){
		if(this.resized == true || globalCanvas.width != window.innerWidth || globalCanvas.height != window.innerHeight){
			if (typeof vrHMD !== 'undefined' && input.isFullscreen()) {

				var canvasWidth, canvasHeight;
				if (typeof vrHMD.getRecommendedRenderTargetSize !== 'undefined') {
					var rect = vrHMD.getRecommendedRenderTargetSize();
					canvasWidth = rect.width;
					canvasHeight = rect.height;
				} else if (typeof vrHMD.getRecommendedEyeRenderRect !== 'undefined') {
					var rectHalf = vrHMD.getRecommendedEyeRenderRect('right');
					canvasWidth = rectHalf.width * 2;
					canvasHeight = rectHalf.height;
				}
				globalCanvas.width = canvasWidth;
				globalCanvas.height = canvasHeight;

			} 
			else{
				globalCanvas.width = window.innerWidth;
				globalCanvas.height = window.innerHeight;
			
			}
			if(mono){
				this.scaleX = this.pixelScale/(1.0*globalCanvas.width);
				this.scaleY = this.pixelScale/(1.0*globalCanvas.height);
				this.hudScaleX = this.hudPixelScale/(1.0*globalCanvas.width);
				this.hudScaleY = this.hudPixelScale/(1.0*globalCanvas.height);
				this.resized = false;
			}
			else{
				this.scaleX = this.pixelScale/(1.0*globalCanvas.width/2);
				this.scaleY = this.pixelScale/(1.0*globalCanvas.height);
				this.hudScaleX = this.hudPixelScale/(1.0*globalCanvas.width/2);
				this.hudScaleY = this.hudPixelScale/(1.0*globalCanvas.height);
				this.resized = false;
			}

		}
	};
})(window);