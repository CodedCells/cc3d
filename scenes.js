var sceneFiles = {
	"jungleheatsky": "Jungle Heat",
	"mawholes": "Maw Holes",
	"fexmilking": "Fex Milking",
	/*"unendinghorny": "Unending Horny",*/
	"ticklishvibedwarden": "Ticklish Vibed Warden",
	"chaltable": "Chal Table"
}

btnContainer = document.getElementById("scenebtn");

for (const [sid, name] of Object.entries(sceneFiles)) {
	const btn = document.createElement('button');
	btn.innerHTML = name;
	btn.setAttribute("onclick", "loadScene('" + sid + "');");
	btnContainer.appendChild(btn);
	//console.log(sid, name);
}