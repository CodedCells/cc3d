import * as core from '/cc3d/core.js';

var fails = 0;

var bottoms = {};
var tops = {};
var scene;

let textures;

var charUI;
var ctx;

let debugControls;

var hasLoaded = false;
var loadCount = 0;
var expectLoad = 0;
var currentSelection = {
	top: {model: undefined, skin: undefined, color: undefined},
	bottom: {model: undefined, skin: undefined, color: undefined}
};

const collarColors = ["FFFFFF", "F07613", "BD44B3", "3AAFD9", "F8C627", "70B919", "ED8DAC", "3E4447", "8E8E86", "158991", "792AAC", "35399D", "724728", "546D1B", "A12722", "141519"];

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
		{"id": "wolf", "src": "MEu8UmF"},
		{"id": "cat", "src": "p19edEJ"},
		{"id": "fox", "src": "cjPa2Gu"},
		//{"id": "donkey", "src": "jVSwlCj"},
		//{"id": "chicken", "src": "5sOwjMn"},
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

function resumePlayback() {
	core.setPlaySpeed(0.8 + (Math.random() * .5));
}

function playPause() {
	if (core.playSpeed > 0) core.setPlaySpeed(0);
	else resumePlayback();
	
	hexGridDrawer();
}

function swapPositions() {
	const top = currentSelection.top;
	const bottom = currentSelection.bottom;
	changeTo('top', bottom);
	changeTo('bottom', top);
}

function changeTo(position, data) {
	
	if (data.skin === undefined) {
		const allowed_textures = Object.keys(textures).filter(key => key.startsWith(data.model + "_"));
	
		if (allowed_textures.length)
			data.skin = allowed_textures[Math.floor(Math.random() * allowed_textures.length)]
		else
			console.log(`No skins for ${data.model}`);
	}
	
	if (data.color === undefined) {
		data.color = Math.floor(Math.random() * 32);
	}
	
	applyTextureToModel(textures[data.skin], `${position}_${data.model}_rig`, data.color);
	currentSelection[position] = data;
	
	if (position == "top")
		showHide(tops, currentSelection.top.model);
	else
		showHide(bottoms, currentSelection.bottom.model);
}

function showHide(targets, desired) {
	const mob = desired;
	for (const [sid, name] of Object.entries(targets)) {
		const kind = name.split("_")[0];
		
		if (!(desired.startsWith(kind)))
			desired = `${kind}_${desired}_rig`;
		
		core.scene.getObjectByName(sid).frustumCulled = false;
		core.scene.getObjectByName(sid).visible = name == desired;
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

function toggleDebugControls() {
	if (debugControls.style.display == "none")
		debugControls.style.display = "block";
	else
		debugControls.style.display = "none";
}

function clickHex(event) {
	var [mouseX, mouseY] = mouseMoveHex(event);
	if (hexInfo.hoverId == null) {// not a hexagon
		if (mouseY < 30)
			toggleDebugControls();
		else if (mouseY < 123) {
			if (mouseX < 56)
				playPause();
			else if (mouseX > 277)
				swapPositions();
		}
		return
	}
	
	var id = hexInfo.hoverId;
	
	//console.log("Hexagon clicked:", hexInfo.hoverId, hexInfo.hexes[id].id);
	
	if (id < 2) {
		hexInfo.modeId = id;
		return
	}
	
	const position = ["top", "bottom"][hexInfo.modeId];
	changeTo(position, {"model": hexInfo.hexes[id].id})
}

function regexModelName(s) {
	const match = s.match(/^(top|bottom)_(.*?)_rig$/);
	return match ? match[2] : null;
}

function getAllMaterials(object) {
    const materials = new Set(); // Using Set to avoid duplicate materials
	
    object.traverse((child) => {
        if (child.isMesh && child.material) {
            // If the material is an array (common for multi-materials), loop through it
            if (Array.isArray(child.material)) {
                child.material.forEach((mat) => materials.add(mat));
            } else {
                materials.add(child.material);
            }
        }
    });

    return Array.from(materials); // Convert the Set back to an Array
}

// Function to apply the selected texture to the currently selected model
function applyTextureToModel(selectedTexture, selectedModelName, selectedColor) {
    const selectedModel = core.scene.getObjectByName(selectedModelName);
	
	if (Number.isInteger(selectedColor))
		selectedColor = collarColors[selectedColor];
	
    if (selectedModel) {
        // Traverse the model and apply the texture to all meshes
        selectedModel.traverse((child) => {
            if (!(child.isMesh && child.material)) return // not a model or no matieral
			if (child.material.name == "planks") return
			//console.log(child.material.name, child.userData);
			child.material = child.material.clone();
			
			if (!child.userData.noSwapTextures)
				child.material.map = selectedTexture;
			
			if (child.userData.tintCollar) {
				child.visible = selectedColor !== undefined
				if (selectedColor !== undefined)
					child.material.color.set("#" + selectedColor);
			}
			
			child.material.needsUpdate = true;
        });
    }
}

function updateControls() {
	loadHexImgs();
	
	// Get all materials in the scene, even from nested children
    const materials = getAllMaterials(core.scene);
    textures = {}; // Store available textures

    // Extract textures from materials
    materials.forEach((material, index) => {
        if (material.map) {
            const textureName = material.map.name || `texture_${index}`;
            textures[textureName] = material.map;
        }
    });
	
	const sceneItems = core.scene.children[1].children;
	for (var i = 0; i < sceneItems.length; i++) {
		const name = sceneItems[i].name;
		
		if (name.startsWith('bottom')) {
			bottoms[name] = name;
			sceneItems[i].position.x = 0;
		}
		else if (name.startsWith('top')) {
			tops[name] = name;
			sceneItems[i].position.x = 0;
		}
	}
	
	changeTo("top", {model: "wolf"})
	changeTo("bottom", {model: "wolf"})
	
	var btnContainer = document.getElementById("scenebtn");
	btnContainer.innerHTML = "";
	
	debugControls = document.createElement('div');
	debugControls.id = "debugControls";
	debugControls.style.display = "none";
	btnContainer.appendChild(debugControls);
	
	var btn = document.createElement('select');
	btn.onchange = function () {
		changeTo("bottom", {model: this.value});
	}
	btn.label = "Select Bottom";

	for (const [sid, name] of Object.entries(bottoms)) {
		var opt = document.createElement('option');
		var parsed = regexModelName(name);
		opt.innerHTML = parsed;
		opt.value = parsed;
		btn.appendChild(opt);
	}
	debugControls.appendChild(btn);

	btn = document.createElement('select');
	btn.onchange = function () {
		changeTo("top", {model: this.value});
	}
	btn.label = "Select Top";

	for (const [sid, name] of Object.entries(tops)) {
		opt = document.createElement('option');
		var parsed = regexModelName(name);
		opt.innerHTML = parsed;
		opt.value = parsed;
		btn.appendChild(opt);
	}
	debugControls.appendChild(btn);
	
	// New Dropdown for Texture Selection
    const textureTopDropdown = document.createElement('select');
    textureTopDropdown.onchange = function () {
		currentSelection.top.skin = this.value;
		changeTo("top", currentSelection.top);
    };
    textureTopDropdown.label = "Select Top Texture";
	
	// New Dropdown for Texture Selection
	const sortedTextureNames = Object.keys(textures).sort();
	
    const textureBottomDropdown = document.createElement('select');
    textureBottomDropdown.onchange = function () {
        currentSelection.bottom.skin = this.value;
		changeTo("bottom", currentSelection.bottom);
    };
    textureBottomDropdown.label = "Select Bottom Texture";
	
    sortedTextureNames.forEach(textureName => {
        const opt = document.createElement('option');
        opt.innerHTML = textureName;
        opt.value = textureName;
        textureTopDropdown.appendChild(opt);
        textureBottomDropdown.appendChild(opt.cloneNode(true));
    });
    debugControls.appendChild(textureTopDropdown);
    debugControls.appendChild(textureBottomDropdown);
	
	btn = document.createElement('button');
	btn.innerHTML = "Set Speed"
	btn.onclick = function () {
		// Prompt the user for input
		let userInput = prompt("Please enter a float number:");

		// Parse the input as a float
		let floatValue = parseFloat(userInput);

		// Check if the input is a valid float number
		if (!isNaN(floatValue)) {
			core.setPlaySpeed(floatValue);
		}
	}
	debugControls.appendChild(btn);
	
	charUI = document.createElement("CANVAS")
	charUI.style.display = "block";
	btnContainer.appendChild(charUI);
	charUI.width = 330;
	charUI.height = 230;
	ctx = charUI.getContext("2d");
	hexGridDrawer();
	
	charUI.addEventListener("mousemove", mouseMoveHex);
	
	charUI.addEventListener("click", clickHex);
	
	onWindowResize();
	core.applicationReady(true);
	resumePlayback();
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
	
	if (img.complete)
		if (img.naturalWidth > 0)
			ctx.drawImage(img, x-gap*1.5, y, height, height);
}

function drawplayPuase() {
	ctx.fillStyle = "#141414";
	if (core.playSpeed > 0) ctx.fillStyle = "#EDD185";
	
	// play/pause
	drawPolygon([
		[5, 35],
		[53.5, 35],
		[53.5, 95],
		[5, 122.5]
	]);
	
	ctx.fill();
	
	ctx.fillStyle = "#141414";
	
	// swap button
	drawPolygon([
		[326.5, 35],
		[278, 35],
		[278, 95],
		[326.5, 122.5]
	]);
	
	ctx.fill();
	
	
	// options button
	drawPolygon([
		[112, 0],
		[166.5, 30],
		[220, 0]
	]);
	
	ctx.fill();
	
	ctx.font = "40px sans-serif";
	ctx.fillStyle = "#fff";
	var text = "II";
	if (core.playSpeed == 0) text = ">";
	ctx.fillText(text, 20, 90);
	ctx.fillText("⇋", 285, 90);
	
	ctx.font = "20px sans-serif";
	ctx.fillText("⚙", 158, 22);
}

function hexGridDrawer() {
	ctx.clearRect(0, 0, charUI.width, charUI.height);
	
	drawplayPuase();
	
	for (var i = 0; i < hexInfo.hexes.length; i++) {
		var data = hexInfo.hexes[i];
		var [col, row] = idxToGrid(i);
		
		const [x, y] = hexPos(col, row, hexInfo.width, hexInfo.height, hexInfo.gap);
		
		ctx.fillStyle = "#141414";
		if (hexInfo.hoverId == i)
			ctx.fillStyle = "#EDD185";
		
		if (hexInfo.modeId == i) {
			ctx.lineWidth = 5;
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
	core.applicationReady(false);
	if (!core.sceneReady) {
		var x = setTimeout(loadedInit, 50);
		loaderDisp.innerHTML += ".";
		return
	}
	loaderDisp.style.display = "none";
	updateControls();
}

init();