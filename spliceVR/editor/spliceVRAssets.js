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
	SpliceVRAssets = function() {
		this.img = new Image();
		this.img.src = './spliceVR/editor/img/menu.png';
		this.ver = [0.1, 0.0, -1.0,1.0, 1.0, 0.0, -0.0, -1.0,0.0, 1.0, 0.0, 0.1, -1.0,0.0, 0.0, 0.1, 0.1, -1.0,1.0, 0.0];
		this.ind =[0,1,3,3,1,2];
		this.pressed = false;
		this.show = true;
		this.x = -1.0;
		this.y = -1.0;
		this.transX = -1.0;
		this.transY = -1.0;
		this.buffer = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();
		renderUtil.createTexBuffer(this.buffer, 'assetsVertexBuffer', this.ver, this.indexBuffer, 'assetsIndexBuffer', this.ind);
		this.tex = gl.createTexture();
		this.update();
	};
	SpliceVRAssets.prototype.update = function() {
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		renderUtil.texUpdate(this.img);
	};
	SpliceVRAssets.prototype.render = function(rotation) {
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		this.x = this.transX/renderFrame.hudScaleX;
		this.y = this.transY/renderFrame.hudScaleY;
		if(renderBottombar.show)
			this.y = this.y+0.25;
		var modelViewMatrix = mat4.create();
		mat4.identity(modelViewMatrix);
		mat4.scale(modelViewMatrix,modelViewMatrix,[renderFrame.hudScaleX, renderFrame.hudScaleY,1.0]);
		mat4.multiply(modelViewMatrix, modelViewMatrix, rotation);
		mat4.translate(modelViewMatrix,modelViewMatrix,[this.x, this.y,0.0]);
		renderUtil.drawRectTex(modelViewMatrix, this.buffer, this.indexBuffer, this.tex);
	};
	SpliceVRAssets.prototype.pointEvent = function(){
		if(this.pressed || this.contains(renderFrame.hudX, renderFrame.hudY)){
			if(renderFrame.touch == 0)
				document.body.style.cursor = 'pointer';
			if(renderFrame.mode == 1)
				this.pressed = true;
			else if(renderFrame.mode == 2 && this.pressed)
				this.pressed = true;
			else if(renderFrame.mode == 3 && this.pressed){
				renderBottombar.show = !renderBottombar.show;
				this.pressed = false;
			}
			else
				this.pressed = false;
			return true;
		}
		return false;
	};
	SpliceVRAssets.prototype.contains = function(x1, y1) {
		if(x1 > this.ver[5]+this.x && x1 < this.ver[0]+this.x && y1 > this.ver[1]+this.y && y1 < this.ver[11]+this.y)
			return true;
		return false;
	};
})(window);