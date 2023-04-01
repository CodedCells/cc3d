var sceneFiles = {
	"": "-- Select Scene --",
	"jungleheatsky": "Jungle Heat",
	"mawholes": "Maw Holes",
	"fexmilking": "Fex Milking",
	/*"unendinghorny": "Unending Horny",*/
	"ticklishvibedwarden": "Ticklish Vibed Warden",
	"chaltable": "Chal Table",
	"trottrim": "Trot Trim"
}
var sceneThumb = {
	"": "-- Select Scene --",
	"jungleheatsky": "50696916@400-1674328260.jpg",
	"mawholes": "46460766@400-1647990532.jpg",
	"fexmilking": "50397423@400-1672272530.jpg",
	/*"unendinghorny": "50841325@400-1675277508.jpg",*/
	"ticklishvibedwarden": "50712717@400-1674425566.jpg",
	"chaltable": "50360630@400-1672010351.jpg",
	"trottrim": "50871958@400-1675470384.jpg"
}

btnContainer = document.getElementById("scenebtn");
const btn = document.createElement('select');
btn.onchange = function () {
	if (this.value)
		loadScene(this.value)
		window.location.hash = "#" + this.value;
		sceneSelectDiv.style.display = "none";
}

btn.onclick = function () {
	sceneSelectDiv.style.display = "block";
}

function loadSceneVis() {
	sceneSelectDiv.style.display = "none";
	loadScene(this.id);
	window.location.hash = "#" + this.id;
}

btn.label = "Select Scene";
var sceneSelectDiv = document.createElement('div');
sceneSelectDiv.className = "sceneSelectVisualiser";

for (const [sid, name] of Object.entries(sceneFiles)) {
	//console.log(sid, name);
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
	if (sceneThumb[sid])
		optVisImg.src = "https://t.furaffinity.net/" + sceneThumb[sid];
	
	optVis.appendChild(optVisImg);
	optVisTitle = document.createElement('span');
	optVisTitle.innerHTML = name;
	optVis.appendChild(optVisTitle);
	sceneSelectDiv.appendChild(optVis);
}
btnContainer.appendChild(btn);

info = document.createElement('span');
info.innerHTML = " Click to Enter, Space to toggle camera, WASD to move freecam, R to reset.";
btnContainer.appendChild(info);

btnContainer.appendChild(sceneSelectDiv);

if (window.location.hash.length < 2) {
	sceneSelectDiv.style.display = "block";
}