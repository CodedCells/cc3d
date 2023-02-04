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

btnContainer = document.getElementById("scenebtn");
const btn = document.createElement('select');
btn.onchange = function () {
	if (this.value)
		loadScene(this.value)
}
btn.label = "Select Scene";

for (const [sid, name] of Object.entries(sceneFiles)) {
	opt = document.createElement('option');
	opt.innerHTML = name;
	opt.value = sid;
	btn.appendChild(opt);
	//console.log(sid, name);
}
btnContainer.appendChild(btn);

info = document.createElement('span');
info.innerHTML = " Click to Enter, Space to toggle camera, WASD to move freecam, R to reset.";
btnContainer.appendChild(info);