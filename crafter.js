loadScene("craftertest");

var bottoms = {};
var tops = {};
var scene = [];

function showHide(targets, desired) {
	for (const [sid, name] of Object.entries(targets)) {
		scene.getObjectByName(sid).visible = name == desired;
		scene.getObjectByName(sid).frustumCulled = false;
	}
	//adjustPos = 
}

function playPause() {
	this.innerHTML = ["Play", "Pause"][play ^= true];
}

function updateControls(scn) {
	scene = scn;
	
	const light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(1, 1, 1);
	scene.add(light);

	sceneItems = scene.children[0].children;
	for (var i = 0; i < sceneItems.length; i++) {
		var name = sceneItems[i].name;
		if (name.startsWith('bottom'))
			bottoms[name] = name;
		
		else if (name.startsWith('top'))
			tops[name] = name;
		
		showHide(tops, Object.keys(tops)[0]);
		showHide(bottoms, Object.keys(bottoms)[0]);
	}

	btnContainer = document.getElementById("scenebtn");
	btnContainer.innerHTML = "";
	
	btn = document.createElement('select');
	btn.onchange = function () {
		showHide(bottoms, this.value);
	}
	btn.label = "Select Bottom";

	for (const [sid, name] of Object.entries(bottoms)) {
		opt = document.createElement('option');
		opt.innerHTML = name;
		opt.value = sid;
		btn.appendChild(opt);
		//console.log(sid, name);
	}
	btnContainer.appendChild(btn);

	btn = document.createElement('select');
	btn.onchange = function () {
		showHide(tops, this.value);
	}
	btn.label = "Select Top";

	for (const [sid, name] of Object.entries(tops)) {
		opt = document.createElement('option');
		opt.innerHTML = name;
		opt.value = sid;
		btn.appendChild(opt);
		//console.log(sid, name);
	}
	btnContainer.appendChild(btn);
	
	btn = document.createElement('button');
	btn.innerHTML = "Pause"
	btn.onclick = playPause;
	btnContainer.appendChild(btn);
	
	info = document.createElement('span');
	info.innerHTML = " Click to Enter, Space to toggle camera, WASD to move freecam, R to reset.";
	btnContainer.appendChild(info);
}