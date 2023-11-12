var defaultScene = "spin";

var sceneFiles = {
	"@crafter": {"name": "Crafter! (Intreactive choice)", "src": "Preblmy.jpg"},
	"@new": {"name": "New Viewer (Beta)", "src": "OgjbCHQ.jpg"},
	"jungleheat": {"name": "Jungle Heat", "src": "JXu1J4t.jpg"},
	"mawholes": {"name": "Maw Holes", "src": "CYAIDPZ.jpeg"},
	"fexmilking": {"name": "Fex Milking", "src": "hG52BHr.jpg"},
	"ticklishvibedwarden": {"name": "Ticklish Vibed Warden", "src": "jZb3FZC.png"},
	"chaltable": {"name": "Chal Table", "src": "GAxkiIZ.jpg"},
	"trottrim": {"name": "Trot Trim", "src": "OlTr9i6.jpg"},
	
	"bigbandet": {"name": "Big Bandet", "src": "tddKPl8.jpg"},
	
	"ossierailed": {"name": "Ossie Railed", "src": "giFZtIz.jpeg"},
	"teamingtheenderdragon": {"name": "Teaming the Enderdragon", "src": "mIE9Ody.jpg", "disabled": true},
	"ktchastity": {"name": "Chaste Chars", "src": "ub9Gabj.jpg", "disabled": true},
	"kttoys": {"name": "Toyed Chars", "src": "kozJPXP.jpg", "disabled": true},
	"llamadupe": {"name": "Llama Dupe", "src": "4BZkyQG.jpeg"},
	"waxplay": {"name": "Wax Play", "src": "G6wu5IG.jpeg", "disabled": true},
	"wolfpack": {"name": "Wolf Pack", "src": "kVJmpJE.jpg", "disabled": true},
	"wolfdance": {"name": "Wolf Dance", "src": "CO67Sm9.jpeg", "disabled": true},
	"pickyourpaws": {"name": "Pick your Paws", "src": "gjJlvti.jpeg", "disabled": true},
	"zoglintesting": {"name": "Zoglin Testing", "src": "alNTN0h.jpg", "disabled": true},
	"sofameme": {"name": "Sofa Meme", "src": "YK3GHtZ.jpeg"},
	"muttonmosh": {"name": "Mutton Mosh", "src": "wl3XNXn.jpeg", "disabled": true},
	"reflection": {"name": "Reflection", "src": "BCKZAhN.jpeg"},
	"bambooawoo": {"name": "Bamboo Awoo", "src": "64Rg3lf.jpg", "disabled": true},
	"dorimedive": {"name": "Dorime Dive", "src": "F37136d.jpg", "disabled": true},
	"brushbutts": {"name": "Brush Butts", "src": "saCIk3n.jpg", "disabled": true},
	"wallbound": {"name": "Wall Bound", "src": "GGhNSEm.jpg", "disabled": true},
	"bigpawworship": {"name": "Big Paw Worship", "src": "v4W8lZY.jpg", "disabled": true},
	"gimpfin": {"name": "Gimpfin", "src": "SyU1W2C.jpg"},
	/*"unendinghorny": {"name": "Unending Horny", "src": "irgfhO9.jpg"},*/
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
	if (this.id == "@crafter") {
		window.location.pathname = "/cc3d/crafter_ui.html";
		return;
	}
	if (this.id == "@new") {
		window.location.pathname = "/cc3d/new/cc3d.html";
		return;
	}
	sceneSelectDiv.style.display = "none";
	loadScene(this.id);
	window.location.hash = "#" + this.id;
}

btn.label = "Select Scene";
sceneSelectDiv.className = "sceneSelectVisualiser";

opt = document.createElement('option');
opt.innerHTML = "-- Select Scene --";
opt.value = "";
btn.appendChild(opt);

for ([sid, data] of Object.entries(sceneFiles)) {
	//console.log(sid, data);
	
	optVis = document.createElement('div');
	optVis.className = "sceneChoice";
	if (data.disabled) continue;
	//	optVis.className += " disabled";
	
	name = data.name;
	if (!sid.startsWith("@")) {
		opt = document.createElement('option');
		opt.innerHTML = name;
		opt.value = sid;
		btn.appendChild(opt);
	}
	
	optVis.id = sid;
	optVis.onclick = loadSceneVis;
	optVisImg = document.createElement('img');
	optVisImg.width = 300;
	optVisImg.height = 225;
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
info.innerHTML = " Click here to open menu. Click view to move, ESC to unlock, SPACE to toggle camera, W/A/S/D to move freecam, Backspace to reset.";
info.onclick = function () {
	var d = sceneSelectDiv.style.display;
	if (d == "none") d = "block";
	else d = "none";
	sceneSelectDiv.style.display = d;
}
btnContainer.appendChild(info);

btnContainer.appendChild(sceneSelectDiv);

if (window.location.hash.length < 2) {
	sceneSelectDiv.style.display = "block";
}