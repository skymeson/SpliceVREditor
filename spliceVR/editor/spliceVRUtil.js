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
	SpliceVRUtil = function() {
	};
	SpliceVRUtil.prototype.createTexBuffer = function(buffer, bufferName, bufferVer, indBuffer, indBufferName, inds) {
		buffer.displayName = bufferName;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER,  new Float32Array(bufferVer), gl.STATIC_DRAW);
		indBuffer.displayName = indBufferName;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,  new Uint16Array(inds), gl.STATIC_DRAW);
	};
	SpliceVRUtil.prototype.texUpdate = function(imgTex) {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,gl.RGBA, gl.UNSIGNED_BYTE, imgTex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.bindTexture(gl.TEXTURE_2D, null);
	};
	SpliceVRUtil.prototype.drawRectTex = function(modelMatrix, buffer, indBuffer, rectTex) {
		var projMatrix = mat4.create();
		var a_xyz = glProgram.attributes['a_xyz'];
		var a_uv = glProgram.attributes['a_uv'];
		mat4.identity(projMatrix);

		mat4.perspective(projMatrix, Math.PI/2.0, 1.0, .1, 100);

		gl.uniformMatrix4fv(glProgram.uniforms['u_projectionMatrix'], false, projMatrix);
		gl.uniformMatrix4fv(glProgram.uniforms['u_modelViewMatrix'], false, modelMatrix);
		gl.enableVertexAttribArray(a_xyz);
		gl.enableVertexAttribArray(a_uv);
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.vertexAttribPointer(a_xyz, 3, gl.FLOAT, false, (3 + 2) * 4, 0);
		gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, (3 + 2) * 4, 3 * 4);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, rectTex);
		gl.uniform1i(glProgram.uniforms['uSampler'], 0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indBuffer);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	};
	SpliceVRUtil.prototype.drawPolygon = function(modelMatrix, vers, inds, rectTex) {
		var projMatrix = mat4.create();
		var a_xyz = glProgram.attributes['a_xyz'];
		var a_uv = glProgram.attributes['a_uv'];
		mat4.identity(projMatrix);
		mat4.perspective(projMatrix, Math.PI/2.0, 1.0, .1, 100);

		var buffer = gl.createBuffer();
		var indBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER,  new Float32Array(vers), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,  new Uint16Array(inds), gl.STATIC_DRAW);
		
		gl.uniformMatrix4fv(glProgram.uniforms['u_projectionMatrix'], false, projMatrix);
		gl.uniformMatrix4fv(glProgram.uniforms['u_modelViewMatrix'], false, modelMatrix);
		gl.enableVertexAttribArray(a_xyz);
		gl.enableVertexAttribArray(a_uv);
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.vertexAttribPointer(a_xyz, 3, gl.FLOAT, false, (3 + 2) * 4, 0);
		gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, (3 + 2) * 4, 3 * 4);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, rectTex);
		gl.uniform1i(glProgram.uniforms['uSampler'], 0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indBuffer);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	};
	SpliceVRUtil.prototype.createWebGL = function(canvas) {
		var attributes = {alpha: false,depth: false,stencil: false,antialias: true,premultipliedAlpha: true,preserveDrawingBuffer: false};
		var names = ['webgl', 'experimental-webgl'];
		var gl = null;
		for (var n = 0; n < names.length; n++) {
			gl = canvas.getContext(names[n], attributes);
			if (gl)
				break;
		}
		return gl;
	};
	SpliceVRUtil.GL_PROGRAM_VER_ = [
		'attribute vec3 a_xyz;',
		'attribute vec2 a_uv;',
		'varying vec2 v_uv;',
		'uniform mat4 u_projectionMatrix;',
		'uniform mat4 u_modelViewMatrix;',
		'void main() {',
		'  gl_Position = u_projectionMatrix * u_modelViewMatrix * ',
		'      vec4(a_xyz, 1.0);',
		'  v_uv = a_uv;',
		'}'
	].join('\n');
	SpliceVRUtil.GL_PROGRAM_PIX_ =	[
		'precision highp float;',
		'varying vec2 v_uv;',
		'uniform sampler2D uSampler;',
		'void main() {',
		'vec4 texelColor = texture2D(uSampler, vec2(v_uv.s, v_uv.t));',
		'  gl_FragColor = vec4(texelColor.rgb, texelColor.a);',
		'}'
	].join('\n');
	SpliceVRUtil.Program = function(theGL, displayName, vertexShaderSource, fragmentShaderSource, attributeNames, uniformNames) {
		this.attributes = {};
		for (var n = 0; n < attributeNames.length; n++)
			this.attributes[attributeNames[n]] = -1;
		this.uniforms = {};
		for (var n = 0; n < uniformNames.length; n++)
			this.uniforms[uniformNames[n]] = null;
		this.gl = theGL;
		this.program_ = this.gl.createProgram();
		this.program_.displayName = displayName;
		var vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
		vertexShader.displayName = displayName + ':VS';
		this.gl.shaderSource(vertexShader, vertexShaderSource);
		this.gl.attachShader(this.program_, vertexShader);
		var fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		fragmentShader.displayName = displayName + ':FS';
		this.gl.shaderSource(fragmentShader, fragmentShaderSource);
		this.gl.attachShader(this.program_, fragmentShader);
	};
	SpliceVRUtil.Program.prototype.beginLinking = function() {
		var shaders = this.gl.getAttachedShaders(this.program_);
		for (var n = 0; n < shaders.length; n++)
			this.gl.compileShader(shaders[n]);
		this.gl.linkProgram(this.program_);
	};
	SpliceVRUtil.Program.prototype.use = function() {
		this.gl.useProgram(this.program_);
	};
	SpliceVRUtil.Program.prototype.endLinking = function() {
		var shaders = this.gl.getAttachedShaders(this.program_);
		for (var n = 0; n < shaders.length; n++) {
			var shaderName = shaders[n].displayName;
			var shaderInfoLog = this.gl.getShaderInfoLog(shaders[n]);
			var compiled = !!this.gl.getShaderParameter(shaders[n], this.gl.COMPILE_STATUS);
			if (!compiled) 
				throw 'Shader ' + shaderName + ' compilation errors:\n' +shaderInfoLog;
			else if (shaderInfoLog && shaderInfoLog.length)
				SpliceVR.log('Shader ' + shaderName + ' compilation warnings:\n' +shaderInfoLog);
		}

		var programName = this.program_.displayName;
		var programInfoLog = this.gl.getProgramInfoLog(this.program_);
		var linked = !!this.gl.getProgramParameter(this.program_, this.gl.LINK_STATUS);
		if (!linked)
			throw 'Program ' + programName + ' link errors:\n' + programInfoLog;
		else if (programInfoLog && programInfoLog.length)
			SpliceVR.log('Program ' + programName + ' link warnings:\n' +programInfoLog);
		for (var attribName in this.attributes)
			this.attributes[attribName] = this.gl.getAttribLocation(this.program_, attribName);
		for (var uniformName in this.uniforms)
			this.uniforms[uniformName] = this.gl.getUniformLocation(this.program_, uniformName);
	};
})(window);