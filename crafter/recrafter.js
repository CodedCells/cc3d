import * as core from '/cc3d/core.js';

var fails = 0;

var bottoms = {};
var tops = {};
var scene;

var charUI;
var ctx;

var hasLoaded = false;
var loadCount = 0;
var expectLoad = 0;
var currentSelection = {
	"top": undefined,
	"bottom": undefined
};

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

function onWindowResize() {

	if (core.camera) {
		core.camera.aspect = window.innerWidth / window.innerHeight;
		core.camera.updateProjectionMatrix();
	}
	core.renderer.setSize( window.innerWidth, window.innerHeight );

	core.render();
}

function playPause() {
	if (core.playSpeed > 0) core.setPlaySpeed(0);
	else core.setPlaySpeed(1);
	
	hexGridDrawer();
}

function swapPositions() {
	[currentSelection["top"], currentSelection["bottom"]] = [currentSelection["bottom"], currentSelection["top"]];
	showHide(tops, currentSelection["top"]);
	showHide(bottoms, currentSelection["bottom"]);
}

function showHide(targets, desired) {
	for (const [sid, name] of Object.entries(targets)) {
		const kind = name.split("_")[0];
		if (!(desired.startsWith(kind)))
			desired = `${kind}_${desired}_rig`;
		
		core.scene.getObjectByName(sid).visible = name == desired;
		core.scene.getObjectByName(sid).frustumCulled = false;
	}
}

function loadHexImgs() {
	if (hasLoaded) return;
	
	for (var i = 0; i < hexInfo.hexes.length; i++) {
		expectLoad += 1;
		var data = hexInfo.hexes[i];
		data.img = new Image();
		data.img.src = "https://i.imgur.com/" + data.src + ".png";
		data.img.onload = function() {
			loadCount += 1;
			if (loadCount >= expectLoad)hexGridDrawer();
		}
	}
	
	hasLoaded = true;
}

function idxToGrid(i) {
	if (i > 1) i++;
	var row = Math.floor(i / hexInfo.cols) + 1;
	var col = i % hexInfo.cols;
	return [col, row];
}

function mouseMoveHex(event) {
	const rect = charUI.getBoundingClientRect();
	const mouseX = event.clientX - rect.left;
	const mouseY = event.clientY - rect.top;
	
	var newHexHovered = null;
	
	for (var i = 0; i < hexInfo.hexes.length; i++) {
		var [col, row] = idxToGrid(i);
		var [x, y] = hexPos(col, row, hexInfo.width, hexInfo.height, hexInfo.gap);
		
		if (isHexagonHovered(x-hexInfo.gap, y, mouseX, mouseY, hexInfo)) {
			newHexHovered = i;
			break;
		}
	}
	
	if (newHexHovered !== hexInfo.hoverId) {
		hexInfo.hoverId = newHexHovered;
		hexGridDrawer();
	}
	return [mouseX, mouseY];
}

function clickHex(event) {
	var [mouseX, mouseY] = mouseMoveHex(event);
	if (hexInfo.hoverId == null) {// not a hexagon
		if (mouseX < 150)
			playPause();
		else
			swapPositions();
		return
	}
	
	var id = hexInfo.hoverId;
	
	console.log("Hexagon clicked:", hexInfo.hoverId, hexInfo.hexes[id].id);
	
	if (id < 2) {
		hexInfo.modeId = id;
		return
	}
	
	var posType = [tops, bottoms][hexInfo.modeId];
	var posName = ["top", "bottom"][hexInfo.modeId];
	currentSelection[posName] = hexInfo.hexes[id].id;
	
	showHide(posType, hexInfo.hexes[id].id);
}

function regexModelName(s) {
	const match = s.match(/^(top|bottom)_(.*?)_rig$/);
	return match ? match[2] : null;
	showHide(posType, hexInfo.hexes[id].id);
}

function updateControls() {
	loadHexImgs();
	const sceneItems = core.scene.children[1].children;
	for (var i = 0; i < sceneItems.length; i++) {
		var name = sceneItems[i].name;
		if (name.startsWith('bottom'))
			bottoms[name] = name;
		
		else if (name.startsWith('top'))
			tops[name] = name;
	}
	
	const defaultTop = "wolf";
	const defaultBottom = "fox";
	showHide(tops, defaultTop);
	showHide(bottoms, defaultBottom);
	
	currentSelection["top"] = defaultTop;
	currentSelection["bottom"] = defaultBottom;
	
	var btnContainer = document.getElementById("scenebtn");
	btnContainer.innerHTML = "";
	
	const debugControls = document.createElement('div');
	debugControls.className = "debugControls";
	btnContainer.appendChild(debugControls);
	
	var btn = document.createElement('select');
	btn.onchange = function () {
		showHide(bottoms, this.value);
		currentSelection["bottom"] = this.value;
	}
	btn.label = "Select Bottom";

	for (const [sid, name] of Object.entries(bottoms)) {
		var opt = document.createElement('option');
		var parsed = regexModelName(name);
		opt.innerHTML = parsed;
		opt.value = parsed;
		btn.appendChild(opt);
		//console.log(sid, name);
	}
	debugControls.appendChild(btn);

	btn = document.createElement('select');
	btn.onchange = function () {
		showHide(tops, this.value);
		currentSelection["top"] = this.value;
	}
	btn.label = "Select Top";

	for (const [sid, name] of Object.entries(tops)) {
		opt = document.createElement('option');
		var parsed = regexModelName(name);
		opt.innerHTML = parsed;
		opt.value = parsed;
		btn.appendChild(opt);
		//console.log(sid, name);
	}
	debugControls.appendChild(btn);
	
	btn = document.createElement('button');
	btn.innerHTML = "Pause"
	btn.onclick = playPause;
	debugControls.appendChild(btn);
	
	charUI = document.createElement("CANVAS")
	charUI.style.display = "block";
	btnContainer.appendChild(charUI);
	charUI.width = 350;
	charUI.height = 350;
	ctx = charUI.getContext("2d");
	hexGridDrawer();
	
	charUI.addEventListener("mousemove", mouseMoveHex);
	
	charUI.addEventListener("click", clickHex);
}

function isHexagonHovered(x, y, mouseX, mouseY, hi) {
	var width = hi.height / 2;
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

function drawPolygon(cooridates) {
	ctx.beginPath();
	
	ctx.moveTo(cooridates[0][0], cooridates[0][1])
	for (var i = 1; i < cooridates.length; i++)
		ctx.lineTo(cooridates[i][0], cooridates[i][1]);
	
	ctx.closePath();
}

function drawHexagon(ctx, x, y, img, width, height, gap) {
	var size = height / 2;
	
	drawPolygon([
		[x + width/2, y],
		[x + width, y + size / 2],
		[x + width, y + 3/2 * size],
		[x + width/2, y + 2 * size],
		[x, y + 3/2 * size],
		[x, y + size / 2]
	]);
	
	ctx.fill();
	ctx.stroke();
	
	if (img.complete)
		if (img.naturalWidth > 0)
			ctx.drawImage(img, x-gap*1.5, y, height, height);
}

function drawplayPuase() {
	ctx.fillStyle = "#141414";
	if (core.playSpeed > 0) ctx.fillStyle = "#EDD185";
	
	drawPolygon([
		[5, 35],
		[53.5, 35],
		[53.5, 95],
		[5, 122.5]
	]);
	
	ctx.fill();
	ctx.stroke();
	
	ctx.font = "40px sans-serif";
	ctx.fillStyle = "#fff";
	var text = "II";
	if (core.playSpeed == 0) text = ">";
	ctx.fillText(text, 20, 90);
	
	ctx.fillStyle = "#141414";
	
	drawPolygon([
		[326.5, 35],
		[278, 35],
		[278, 95],
		[326.5, 122.5]
	]);
	
	ctx.fill();
	ctx.stroke();
	
	ctx.fillStyle = "#fff";
	ctx.fillText("⇋", 285, 90);
}

function hexGridDrawer() {
	ctx.clearRect(0, 0, charUI.width, charUI.height);
	
	drawplayPuase();
	
	for (var i = 0; i < hexInfo.hexes.length; i++) {
		var data = hexInfo.hexes[i];
		var [col, row] = idxToGrid(i);
		
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

function init() {
	var loaderDisp = document.getElementById("loader");
	loaderDisp.innerHTML = "Loading";
	
	const container = document.createElement( 'div' );
	document.body.appendChild( container );
	
	core.initialiseDefaultScene(container);
	
	window.addEventListener( 'resize', onWindowResize );
	
	var loadThis = 'recrafter_initial';
	core.loadScene(loadThis, './');
	loadedInit();
}

function loadedInit() {
	var loaderDisp = document.getElementById("loader");
	
	if (!core.sceneReady) {
		var x = setTimeout(loadedInit, 50);
		loaderDisp.innerHTML += ".";
		return
	}
	loaderDisp.style.display = "none";
	updateControls();
}

init();