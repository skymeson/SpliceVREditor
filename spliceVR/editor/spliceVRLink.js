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
	SpliceVRLink = function(n1, n2) {
		this.img = new Image();
		this.img.src = './spliceVR/editor/img/link.png';
		this.node1 = n1;
		this.node2 = n2;
		this.tex = gl.createTexture();
		this.ver = [0.0, 0.0, -1.0,1.0, 1.0, 0.0, 0.0, -1.0,0.0, 1.0, 0.0, 0.0, -1.0,0.0, 0.0, 0.0, 0.0, -1.0,1.0, 0.0];
		this.ind =[0,1,3,3,1,2];
		this.update();
	};
	SpliceVRLink.prototype.update = function() {
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		renderUtil.texUpdate(this.img);
	};
	SpliceVRLink.prototype.render = function(rotation) {
		var node1X =((this.node1.x-renderFrame.transX));
		var node1Y = ((this.node1.y-renderFrame.transY));
		var node2X =((this.node2.x-renderFrame.transX)); 
		var node2Y = ((this.node2.y-renderFrame.transY));
		var angle = Math.atan2(node2Y-node1Y, node2X-node1X-0.44);
		this.ver[0] = node1X+0.22+0.01*Math.sin(angle);
		this.ver[1] = node1Y-0.01*Math.cos(angle);
		this.ver[2] = -1.0+renderFrame.zoom;
		this.ver[5] = node2X-0.22+0.01*Math.sin(angle);
		this.ver[6] = node2Y-0.01*Math.cos(angle);
		this.ver[7] = -1.0+renderFrame.zoom;
		this.ver[10] = node2X-0.22-0.01*Math.sin(angle);
		this.ver[11] = node2Y+0.01*Math.cos(angle);
		this.ver[12] = -1.0+renderFrame.zoom;
		this.ver[15] = node1X+0.22-0.01*Math.sin(angle);
		this.ver[16] = node1Y+0.01*Math.cos(angle);
		this.ver[17] = -1.0+renderFrame.zoom;
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		var modelViewMatrix = mat4.create();
		mat4.identity(modelViewMatrix);
		mat4.scale(modelViewMatrix,modelViewMatrix,[renderFrame.scaleX, renderFrame.scaleY,1.0]);
		mat4.multiply(modelViewMatrix, modelViewMatrix, rotation);
		renderUtil.drawPolygon(modelViewMatrix, this.ver, this.ind, this.tex);
	};
	SpliceVRLink.prototype.pointEvent = function(){
		return false;
	};
	SpliceVRLink.prototype.contains = function(x1, y1) {
	    var b1 = (((x1 - this.ver[5]) * (this.ver[1] - this.ver[6]) - (this.ver[0] - this.ver[5]) * (y1 - this.ver[6])) < 0.0);
	    var b2 =(((x1 - this.ver[10]) * (this.ver[6] - this.ver[11]) - (this.ver[5] - this.ver[10]) * (y1 - this.ver[11])) < 0.0);
	    var b3 =(((x1 - this.ver[0]) * (this.ver[11] - this.ver[1]) - (this.ver[10]- this.ver[0]) * (y1 - this.ver[1])) < 0.0);
		var b4 =(((x1 - this.ver[15]) * (this.ver[11] - this.ver[16]) - (this.ver[10] - this.ver[15]) * (y1 - this.ver[16])) < 0.0);
	    var b5 =(((x1 - this.ver[0]) * (this.ver[16] - this.ver[1]) - (this.ver[15] - this.ver[0]) * (y1 - this.ver[1])) < 0.0);
	    var b6 =(((x1 - this.ver[10]) * (this.ver[1] - this.ver[11]) - (this.ver[0]- this.ver[10]) * (y1 - this.ver[11])) < 0.0);
	    if(((b1 == b2) && (b2 == b3)) || ((b4 == b5) && (b5 == b6)))
			return true;
		return false;
	};
})(window);