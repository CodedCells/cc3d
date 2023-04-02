var sceneFiles = {
	"": {"name": "-- Select Scene --"},
	"jungleheat": {"name": "Jungle Heat", "src": "JXu1J4t.jpg"},
	"mawholes": {"name": "Maw Holes", "src": "CYAIDPZ.jpeg"},
	"fexmilking": {"name": "Fex Milking", "src": "hG52BHr.jpg"},
	"ticklishvibedwarden": {"name": "Ticklish Vibed Warden", "src": "jZb3FZC.png"},
	"chaltable": {"name": "Chal Table", "src": "GAxkiIZ.jpg"},
	"trottrim": {"name": "Trot Trim", "src": "OlTr9i6.jpg"},
	
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
	sceneSelectDiv.style.display = "none";
	loadScene(this.id);
	window.location.hash = "#" + this.id;
}

btn.label = "Select Scene";
sceneSelectDiv.className = "sceneSelectVisualiser";

for (const [sid, data] of Object.entries(sceneFiles)) {
	//console.log(sid, data);
	
	optVis = document.createElement('div');
	optVis.className = "sceneChoice";
	if (data.disabled) continue;
	//	optVis.className += " disabled";
	
	name = data.name;
	opt = document.createElement('option');
	opt.innerHTML = name;
	opt.value = sid;
	btn.appendChild(opt);
	
	if (sid == "") continue;
	
	
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