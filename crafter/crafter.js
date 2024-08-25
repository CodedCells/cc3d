loadScene("craftertest");

var bottoms = {};
var tops = {};
var scene = [];

var charUI;
var ctx;

var hasLoaded = false;
var loadCount = 0;
var expectLoad = 0;

var hexInfo = {
	"cols": 3,
	"width": 60 * Math.sqrt(3),
	"height": 120,
	"gap": 5,
	"hoverId": null,
	"modeId": 0,
	"hexes": [
		{"id": "top", "src": "oSQgWmz"},
		{"id": "bottom", "src": "J0MJ9Rj"},
		{"id": "cat", "src": "p19edEJ"},
		{"id": "chicken", "src": "5sOwjMn"},
		{"id": "donkey", "src": "jVSwlCj"},
		{"id": "fox", "src": "cjPa2Gu"},
		{"id": "wolf", "src": "MEu8UmF"}
	]
}

function loadHexImgs() {
	if (hasLoaded) return;
	
	for (let i = 0; i < hexInfo.hexes.length; i++) {
		expectLoad += 1;
		data = hexInfo.hexes[i];
		data.img = new Image();
		data.img.src = "https://i.imgur.com/" + data.src + ".png";
		data.img.onload = function() {
			loadCount += 1;
			if (loadCount >= expectLoad)hexGridDrawer();
		}
	}
	
	hasLoaded = true;
}

function showHide(targets, desired) {
	for (const [sid, name] of Object.entries(targets)) {
		scene.getObjectByName(sid).visible = name == desired;
		scene.getObjectByName(sid).frustumCulled = false;
	}
}

function playPause() {
	this.innerHTML = ["Play", "Pause"][play ^= true];
}

function idxToGrid(i) {
	if (i > 1) i++;
	row = Math.floor(i / hexInfo.cols) + 1;
	col = i % hexInfo.cols;
	return [col, row];
}

function mouseMoveHex(event) {
	const rect = charUI.getBoundingClientRect();
	const mouseX = event.clientX - rect.left;
	const mouseY = event.clientY - rect.top;
	
	let newHexHovered = null;
	
	for (let i = 0; i < hexInfo.hexes.length; i++) {
		[col, row] = idxToGrid(i);
		[x, y] = hexPos(col, row, hexInfo.width, hexInfo.height, hexInfo.gap);
		
		if (isHexagonHovered(x-hexInfo.gap, y, mouseX, mouseY, hexInfo)) {
			newHexHovered = i;
			break;
		}
	}
	
	if (newHexHovered !== hexInfo.hoverId) {
		hexInfo.hoverId = newHexHovered;
		hexGridDrawer();
	}
	
}

function clickHex(event) {
	mouseMoveHex(event);
	if (hexInfo.hoverId == null) return;
	
	id = hexInfo.hoverId;
	
	console.log("Hexagon clicked:", hexInfo.hoverId, hexInfo.hexes[id].id);
	
	if (id < 2) {
		hexInfo.modeId = id;
		return
	}
	
	posType = [tops, bottoms][hexInfo.modeId];
	posName = ["top", "bottom"][hexInfo.modeId];
	
	showHide(posType, posName + "_" + hexInfo.hexes[id].id + "_rig");
}

function updateControls(scn) {
	loadHexImgs();
	scene = scn;
	
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
	/*
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
	*/
	charUI = document.createElement("CANVAS")
	charUI.style.display = "block";
	btnContainer.appendChild(charUI);
	charUI.width = 350;
	charUI.height = 350;
	ctx = charUI.getContext("2d");
	hexGridDrawer(hexInfo);
	
	charUI.addEventListener("mousemove", mouseMoveHex);
	
	charUI.addEventListener("click", clickHex);
}

function isHexagonHovered(x, y, mouseX, mouseY, hi) {
	width = hi.height / 2;
	const innerRadius = width - hi.gap;
	const centerX = x + width - hi.gap;
	const centerY = y + width + hi.gap;
	
	const dx = mouseX - centerX;
	const dy = mouseY - centerY;
	const distance = Math.sqrt(dx * dx + dy * dy);
	
	return distance < innerRadius;
}

function hexPos(col, row, width, height, gap) {
	const x = gap + col * (width + gap) + ((row % 2) * (width + gap)) / 2;
	const y = (row * (height * 3/4) + height / 4) + (row*gap);
	return [x, y - height];
}

function drawHexagon(ctx, x, y, img, width, height, gap) {
	size = height / 2;
	ctx.beginPath();
	ctx.moveTo(x + width/2, y);
	ctx.lineTo(x + width, y + size / 2);
	ctx.lineTo(x + width, y + 3/2 * size);
	ctx.lineTo(x + width/2, y + 2 * size);
	ctx.lineTo(x, y + 3/2 * size);
	ctx.lineTo(x, y + size / 2);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	
	if (img.complete)
		if (img.naturalWidth > 0)
			ctx.drawImage(img, x-gap*1.5, y, height, height);
}

function hexGridDrawer() {
	ctx.clearRect(0, 0, charUI.width, charUI.height);
	
	for (let i = 0; i < hexInfo.hexes.length; i++) {
		data = hexInfo.hexes[i];
		[col, row] = idxToGrid(i);
		
		const [x, y] = hexPos(col, row, hexInfo.width, hexInfo.height, hexInfo.gap);
		
		ctx.fillStyle = "#141414";
		ctx.strokeStyle = "transparent";
		if (hexInfo.hoverId == i)
			ctx.fillStyle = "#EDD185";
		
		if (hexInfo.modeId == i) {
			ctx.lineWidth = 5;
			ctx.strokeStyle = "#EDD185";
		}
		
		drawHexagon(ctx, x, y, data.img, hexInfo.width, hexInfo.height, hexInfo.gap);
	}
}