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
	SpliceVRVideos = function() {
		this.titles = [];
		this.thumbnails = [];
		var xhttp = new XMLHttpRequest();
		xhttp.open('GET', 'videos.xml', false);
		try{
			xhttp.send();
			var videosDoc = xhttp.responseXML;
			var videosStr = videosDoc.getElementsByTagName('title');
			for(var i = 0; i < videosStr.length; i++){
				this.titles[i] = videosStr[i].childNodes[0].nodeValue;
			}
			var thumbnailStr = videosDoc.getElementsByTagName('thumbnail');
			for(var i = 0; i < thumbnailStr.length; i++){
				this.thumbnails[i] = new Image();
				this.thumbnails[i].crossOrigin = "";
				this.thumbnails[i].src = thumbnailStr[i].childNodes[0].nodeValue;
			}
		}
		catch(e){
			
		}
	};
})(window);