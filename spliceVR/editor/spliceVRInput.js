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
	SpliceVRInput = function() {
		var t = this;
		if (navigator.getVRDevices) 
			navigator.getVRDevices().then(t.vrDeviceCallback);
		document.addEventListener('mousewheel', function(e) {e.preventDefault(); t.scrollEvent(e); window.scrollTo(0, 0);},false);
		document.addEventListener('DOMMouseScroll', function(e) {e.preventDefault(); t.scrollEvent(e); window.scrollTo(0, 0);},false);
		document.addEventListener('scroll', function(e){ e.preventDefault(); t.scrollEvent(e); window.scrollTo(0, 0); },false);
		document.addEventListener('touchstart', function(e){e.preventDefault(); t.pointEvent(e, 1, 1);  },false);
		document.addEventListener('touchmove', function(e){ e.preventDefault(); t.pointEvent(e, 2, 1); },false);
		document.addEventListener('touchend', function(e){ e.preventDefault(); t.pointEvent(e, 3, 1); },false);
		document.addEventListener('touchcancel', function(e){ e.preventDefault(); t.pointEvent(e, 3, 1); },false);
		document.addEventListener('mousedown', function(e){ t.pointEvent(e, 1, 0); },false);
		document.addEventListener('mousemove', function(e){ t.pointEvent(e,2, 0); },false);
		document.addEventListener('mouseup', function(e){ t.pointEvent(e,3, 0); },false);
		document.addEventListener('keydown', function(e) {e.preventDefault(); t.key(e, 1); },false);
		document.addEventListener('keyup', function(e) {e.preventDefault(); t.key(e, 0);}, false);
	};
	SpliceVRInput.prototype.vrDeviceCallback = function (vrdevs) {
		for (var i = 0; i < vrdevs.length; ++i) {
			if (vrdevs[i] instanceof HMDVRDevice) {
				vrHMD = vrdevs[i];
				break;
			}
		}
		if (!vrHMD){
			vrHMD = 0;
			return;
		}
		for (var i = 0; i < vrdevs.length; ++i) {
			if (vrdevs[i] instanceof PositionSensorVRDevice && vrdevs[i].hardwareUnitId == vrHMD.hardwareUnitId){
				vrSensor = vrdevs[i];
				break;
			}
		}
	};
	SpliceVRInput.prototype.pointEvent = function(e, mode, touch){
		renderFrame.pointEvent(e, mode, touch);
		var pressed = false;
		pressed = pressed | renderZoom.pointEvent();
		if(!pressed)
			pressed = pressed | renderMenu.pointEvent();
		if(!pressed)
			pressed = pressed | renderAssets.pointEvent();
		if(!pressed)
			pressed = pressed | renderBottombar.pointEvent();
		if(!pressed)
			pressed = pressed | renderSidebar.pointEvent();
		if(!pressed)
			pressed = pressed | renderAdd.pointEvent();

		for (var i = 0; i < renderNodes.length; i++) {
			if(!pressed)
				pressed = pressed | renderNodes[i].pointEvent();
		}

		for (var i = 0; i < renderLinks.length; i++) {
			if(!pressed && renderFrame.mode == 1 && renderLinks[i].contains(renderFrame.adjX-renderFrame.transX, renderFrame.adjY-renderFrame.transY)){
				renderLinks.splice(i,1);
				pressed = true;
			}
		}
		
		if(!pressed){
			if(touch == 0)
				document.body.style.cursor = 'default';
			if(mode == 1)
				renderFrame.dragged = true;
			else if(renderFrame.dragged && mode == 2){
				renderFrame.transX -= (-renderFrame.zoom+1)*(renderFrame.pixX-renderFrame.prevPixX)/(renderFrame.scaleX*globalCanvas.width*0.5);
				renderFrame.transY -= (-renderFrame.zoom+1)*(renderFrame.pixY-renderFrame.prevPixY)/(renderFrame.scaleY*globalCanvas.height*0.5);
			}
			else
				renderFrame.dragged = false;
		}
		else
			renderFrame.dragged = false;
		
		renderFrame.prevX = renderFrame.cX;
		renderFrame.prevY = renderFrame.cY;
		renderFrame.prevPixX = renderFrame.pixX;
		renderFrame.prevPixY = renderFrame.pixY;
	};
	SpliceVRInput.prototype.scrollEvent = function(e){
		if(renderSidebar.show && renderSidebar.contains(renderFrame.hudX, renderFrame.hudY)){
			if(e.wheelDeltaY && renderSidebar.videoScrollY+e.wheelDeltaY  <= 0)
				renderSidebar.videoScrollY += e.wheelDeltaY;
			else if(e.detail)
				renderSidebar.videoScrollY += e.detail;
			else if(window.pageYOffset && renderSidebar.videoScrollY-window.pageYOffset <= 0)
				renderSidebar.videoScrollY -= window.pageYOffset;
		}
		else if(renderBottombar.show && renderBottombar.contains(renderFrame.hudX, renderFrame.hudY)){
			if(e.wheelDeltaX && renderBottombar.videoScrollX+e.wheelDeltaX <= 0)
				renderBottombar.videoScrollX += e.wheelDeltaX;
			else if(e.wheelDeltaY && renderBottombar.videoScrollX+e.wheelDeltaY <= 0)
				renderBottombar.videoScrollX += e.wheelDeltaY;
			else if(e.detail)
				renderBottombar.videoScrollX += e.detail;
			else if(window.pageYOffset && renderBottombar.videoScrollX-window.pageYOffset <= 0)
				renderBottombar.videoScrollX -= window.pageYOffset;
		}
		else{
			if(e.wheelDeltaY)
				renderFrame.zoom+=(e.wheelDeltaY/500.0);
			else if(e.detail)
				renderFrame.zoom+=(e.detail/500.0);
			else if(window.pageYOffset)
				renderFrame.zoom+=(window.pageYOffset/500.0);

			renderFrame.resized = true; 
		}
	};
	SpliceVRInput.prototype.key = function(event, value) {
		if(value == 1){
			switch (event.keyCode) {
				case 86: mono = !mono; break;
				case 70: this.fullscreen(); break;
			}
		}
		renderFrame.resized = true;
	};
	SpliceVRInput.prototype.fullscreen = function() {
		if(this.isFullscreen()){
			if(vrHMD)
				mono= true;
			if (document.mozCancelFullScreen)
				document.mozCancelFullScreen(); 
			else if (document.webkitExitFullscreen)
				document.webkitExitFullscreen();
			else if (document.exitFullscreen)
				document.exitFullscreen();
		}
		else{
			if(vrHMD)
				mono= false;
			if (globalCanvas.mozRequestFullScreen)
				globalCanvas.mozRequestFullScreen({ vrDisplay: vrHMD }); 
			else if (globalCanvas.webkitRequestFullscreen)
				globalCanvas.webkitRequestFullscreen({ vrDisplay: vrHMD });
			else if (canvas.requestFullscreen)
				globalCanvas.requestFullscreen();
		}
	};
	SpliceVRInput.prototype.isFullscreen = function() {
		return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.webkitCurrentFullScreenElement;
	};
})(window);