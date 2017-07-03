var _head = document.getElementsByTagName("head")[0],
		_ul = document.getElementsByTagName("ul")[0],
		_ulTwo = document.getElementsByTagName("ul")[1],
		musicSearchInput = document.getElementById("music-search-input"),
		musicDown = document.getElementById("music-down"),
		audioItem = document.getElementById("audio-item"),
		play = document.getElementById("play"),
		musicDetailBox = document.getElementById("music-detail-box"),
		musicList = document.getElementById("music-list"),
		pcLi = _ulTwo.getElementsByTagName("li"),
		urlOne,		//搜索JSONP请求URL
		urlTwo, 	//歌曲JSONP请求URL
		eventTime,  //定时函数保存变量
		localData,  //localStorage数据
		nowPlay;	//当前播放歌曲索引
	//把JSONP链接插入head
	function jsonp(url){
		var _script = document.createElement("script");
		_script.src = url;
		_head.appendChild(_script);
		_head.removeChild(_script);
		_script = null;
	}
	//事件绑定兼容
	function addEvent(target, method, func) {
		if(document.addEventListener) {
			target.addEventListener(method, func);
		} else if(document.attachEvent) {
			target.attachEvent("on" + method, func);
		} else {
			target["on" + method] = func;
		}
	}
	//个人列表事件代理函数
	function pcList(e) {
		var e = e || window.event,
			target = e.target || e.srcElement;
			//判断是哪个目标元素被点击
		if(target.nodeName.toLowerCase() == 'li') {
			urlTwo = "http://tingapi.ting.baidu.com/v1/restserver/ting?method=baidu.ting.song.play&songid=" + target.value + "&callback=music";
			jsonp(urlTwo);
			play.innerHTML = "暂停";
			musicDetailBox.innerHTML = '播放中：' + target.innerHTML.slice(0,target.innerHTML.length-36);
			nowPlay = Array.prototype.indexOf.call(pcLi, target);
		}else if (target.nodeName.toLowerCase() == 'button') {
			var objValue;
			objValue = target.parentNode.value;
			localData = JSON.parse(localStorage.musicPc);
			for (var i=0;i<localData.length;i++) {
				if(localData[i].value === objValue) {
					localData.splice(i,1);
					break;
				}
			}
			localStorage.musicPc = JSON.stringify(localData);
			this.removeChild(target.parentNode);
			objValue = null;
		}
	}
	//搜索列表事件代理代理函数
	function searchList(e) {
		var e = e || window.event,
			target = e.target || e.srcElement;
		if(target.nodeName.toLowerCase() == 'li') {
			urlTwo = "http://tingapi.ting.baidu.com/v1/restserver/ting?method=baidu.ting.song.play&songid=" + target.value + "&callback=music";
			jsonp(urlTwo);
			play.innerHTML = "暂停";
			musicDetailBox.innerHTML = '正在播放：' + target.innerHTML.slice(0,target.innerHTML.length-36);
		}else if (target.nodeName.toLowerCase() == 'button') {
			var obj = {};
			target.innerHTML = "-";
			obj.name = target.parentNode.innerHTML;
			obj.value = target.parentNode.value;
			_ulTwo.appendChild(target.parentNode);
			localData = JSON.parse(localStorage.musicPc);
			localData.push(obj);
			localStorage.musicPc = JSON.stringify(localData);
		}
	}
	//初始化
	function init () {
		var liItem;
		musicSearchInput.value = '';
		//若第一次，创建localStorage个人列表空数据
		if(!localStorage.musicPc) {
			localStorage.musicPc = JSON.stringify([]);
		}
		//取出localStorage数据
		localData = JSON.parse(localStorage.musicPc);
		//把数据渲染到HTML页面
		for(var i=0;i<localData.length;i++) {
			liItem = document.createElement("li");
			liItem.value = localData[i].value;
			liItem.innerHTML = localData[i].name;
			_ulTwo.appendChild(liItem);
			liItem = null;
		}
		//个人列表事件代理
		addEvent(_ulTwo, "click", pcList);
		//搜索列表事件代理
		addEvent(_ul, "click", searchList);
	}
	//搜索JSONP请求回调函数
	function search(data){
		if(data.error_message === "failed") {
			_ul.innerHTML = "\<li\>搜索不到歌曲\<\/li\>";
			return;
		}
		var leg = data.song.length,
			theData = data.song,
			liItem;
		_ul.innerHTML = "";
		for (var i=0;i<leg;i++) {
			liItem = document.createElement("li");
			liItem.innerHTML = " " + theData[i].songname + "———" + theData[i].artistname + "\<button class=\"add-music\"\>+\</button\>";
			liItem.value = theData[i].songid;
			_ul.appendChild(liItem);
			liItem = null;
		}
	}
	//歌曲JSONP请求回调函数
	function music(data) {
		audioItem.src = data.bitrate.file_link;
		musicDown.href = data.bitrate.file_link;
	}
	//键盘事件和函数防抖函数
	function musicSearch() {
		var that = this;
		clearTimeout(eventTime);
		eventTime = setTimeout(function(){
			if(that.value) {
				urlOne = "http://tingapi.ting.baidu.com/v1/restserver/ting?method=baidu.ting.search.catalogSug&query=" + that.value + "&callback=search";
				jsonp(urlOne);
				musicList.className = "animated bounceInLeft";
				musicList.style.display = "block";
			}else {
				_ul.innerHTML = "";
				musicList.className = "animated bounceOutLeft";
			}
		}, 1000);
	}
	//播放点击事件函数
	function playFunc() {
		if(audioItem.src) {
			if(audioItem.paused) {
				audioItem.play();
				play.innerHTML = "暂停";
			}else {
				audioItem.pause();
				play.innerHTML = "播放";
			}
		}
	}
	//播放完成切歌事件函数
	function musicToggle() {
		if(pcLi.length > 1) {
			nowPlay++;
			if(pcLi.length-1 >= nowPlay) {
				pcLi[nowPlay].click();
			}
		}
	}
	//初始化
	init();
	//自动搜索、键盘事件
	addEvent(musicSearchInput, "keyup", musicSearch);
	//播放点击事件
	addEvent(play, "click", playFunc);
	//播放完成切歌
	addEvent(audioItem, "ended", musicToggle);