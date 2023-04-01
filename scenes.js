var sceneFiles = {
	"": {"name": "-- Select Scene --"},
	"jungleheatsky": {"name": "Jungle Heat", "src": "JXu1J4t.jpg.jpg"},
	"mawholes": {"name": "Maw Holes", "src": "CYAIDPZ.jpeg"},
	"fexmilking": {"name": "Fex Milking", "src": "hG52BHr.jpg"},
	/*"unendinghorny": {"name": "Unending Horny", "src": "irgfhO9.jpg"},*/
	"ticklishvibedwarden": {"name": "Ticklish Vibed Warden", "src": "jZb3FZC.png"},
	"chaltable": {"name": "Chal Table", "src": "GAxkiIZ.jpg"},
	"trottrim": {"name": "Trot Trim", "src": "OlTr9i6.jpg"},
}

btnContainer = document.getElementById("scenebtn");
var sceneSelectDiv = document.createElement('div');

const btn = document.createElement('select');
btn.onchange = function () {
	if (this.value) {
		loadScene(this.value);
		window.location.hash = "#" + this.value;
	}
}

function loadSceneVis() {
	sceneSelectDiv.style.display = "none";
	loadScene(this.id);
	window.location.hash = "#" + this.id;
}

btn.label = "Select Scene";
sceneSelectDiv.className = "sceneSelectVisualiser";

for (const [sid, data] of Object.entries(sceneFiles)) {
	//console.log(sid, data);
	name = data.name;
	opt = document.createElement('option');
	opt.innerHTML = name;
	opt.value = sid;
	btn.appendChild(opt);
	
	if (sid == "") continue;
	
	optVis = document.createElement('div');
	optVis.className = "sceneChoice";
	optVis.id = sid;
	optVis.onclick = loadSceneVis;
	optVisImg = document.createElement('img');
	optVisImg.loading = "lazy";
	
	optVisImg.src = "https://i.imgur.com/" + data.src;
	
	optVis.appendChild(optVisImg);
	optVisTitle = document.createElement('span');
	optVisTitle.innerHTML = name;
	optVis.appendChild(optVisTitle);
	sceneSelectDiv.appendChild(optVis);
}
btnContainer.appendChild(btn);

info = document.createElement('span');
info.innerHTML = " Click to Enter, ESC to unlock, SPACE to toggle camera, W/A/S/D to move freecam, R to reset. CLick here to open menu.";
info.onclick = function () {sceneSelectDiv.style.display = "block";}
btnContainer.appendChild(info);

btnContainer.appendChild(sceneSelectDiv);

if (window.location.hash.length < 2) {
	sceneSelectDiv.style.display = "block";
	loadScene("spin");
}