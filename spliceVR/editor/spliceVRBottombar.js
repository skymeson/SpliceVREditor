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
	SpliceVRBottombar = function() {
		this.img = new Image();
		this.img.src = './spliceVR/editor/img/sidebar.png';
		this.ver = [4.0, 0.0, -1.0,1.0, 1.0, 0.0, 0.0, -1.0,0.0, 1.0, 0.0, 0.25, -1.0,0.0, 0.0, 4.0, 0.25, -1.0,1.0, 0.0];
		this.ind =[0,1,3,3,1,2];
		this.pressed = false;
		this.show = false;
		this.videoSelected = -1;

		this.textCanvas = document.createElement('canvas');
		this.textCanvas.width = renderFrame.hudScaleX*globalCanvas.width*2;
		this.textCanvas.height = renderFrame.hudScaleY*globalCanvas.height/8;
		this.textCanvas.style.width = renderFrame.hudScaleX*globalCanvas.width*2 + 'px';
		this.textCanvas.style.height = renderFrame.hudScaleY*globalCanvas.height/8 + 'px';
		this.ctx = this.textCanvas.getContext('2d');
		
		this.x = -1.0;
		this.y = -1.0;
		this.transX = -1.0;
		this.transY = -1.0;
		this.hudScaleYStart = renderFrame.hudScaleY;
		this.videoScrollX = 0;
		
		this.buffer = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();
		renderUtil.createTexBuffer(this.buffer, 'bottombarVertexBuffer', this.ver, this.indexBuffer, 'bottombarIndexBuffer', this.ind);
		this.tex = gl.createTexture();
		this.update();
	};
	SpliceVRBottombar.prototype.update = function() {
		this.ctx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
		this.ctx.fillStyle = '#C0C0C0';
		this.ctx.fillRect(0,0,this.textCanvas.width, this.textCanvas.height);
		this.ctx.fillStyle = '#000000';
		this.ctx.font = '16px helvetica lighter';
		for(var i = 0; i < spliceVideos.titles.length; i++){
			var str = spliceVideos.titles[i];
			var strW = this.ctx.measureText(str).width;
			var x = 100-strW/2;
			this.ctx.fillText(str, i*200+x+this.videoScrollX, 120);
		}
		for(var i = 0; i < spliceVideos.thumbnails.length; i++)
			this.ctx.drawImage(spliceVideos.thumbnails[i],8+i*200+this.videoScrollX,8,192,96);

		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		renderUtil.texUpdate(this.textCanvas);
	};
	SpliceVRBottombar.prototype.render = function(rotation) {
		if(!this.show)
			return;

		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		var modelViewMatrix = mat4.create();
		this.x = this.transX/renderFrame.hudScaleX;
		this.y = this.transY/renderFrame.hudScaleY;
		
		mat4.identity(modelViewMatrix);
		mat4.scale(modelViewMatrix,modelViewMatrix,[renderFrame.hudScaleX, renderFrame.hudScaleY,1.0]);
		mat4.multiply(modelViewMatrix, modelViewMatrix, rotation);
		mat4.translate(modelViewMatrix,modelViewMatrix,[this.x,this.y,0.0]);
		renderUtil.drawRectTex(modelViewMatrix, this.buffer, this.indexBuffer, this.tex);
	};
	SpliceVRBottombar.prototype.pointEvent = function(){
		if(this.show && (this.pressed || this.contains(renderFrame.hudX, renderFrame.hudY))){
			if(renderFrame.touch == 0){
				document.body.style.cursor = 'pointer';
			}
			if(renderFrame.mode == 1){
				this.pressed = true;
				this.videoSelected = (((renderFrame.cX-renderFrame.rect.left-this.videoScrollX))/200) | 0;
			}
			else if(renderFrame.mode == 3){
				if(this.videoSelected >= 0){
					for (var i = 0; i < renderNodes.length; i++) {
						if(renderNodes[i].contains(renderFrame.adjX,renderFrame.adjY)){
							if(renderNodes[i].videos.length == 0)
								renderNodes[i].thumbnail = spliceVideos.thumbnails[this.videoSelected];
							if(renderNodes[i].videos.length < 5)
								renderNodes[i].videos[renderNodes[i].videos.length] = this.videoSelected;
						}
					}
					this.videoSelected = -1;
				}
				this.pressed = false;
			}
			return true;
		}
		return false;
	};
	SpliceVRBottombar.prototype.contains = function(x1, y1) {
		if(x1 > this.ver[5]+this.x && x1 < this.ver[0]+this.x && y1 > this.ver[1]+this.y && y1 < this.ver[11]+this.y){
			return true;
		}
		return false;
	};
})(window);