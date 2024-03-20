import * as core from './core.js';

var fails = 0;
var scenes = {};
var sceneIds = {};
var storedOrder;
const linkDisp = document.createElement('span');

function reload() {
	var newState = window.location.pathname;
	var query = this.id;
	
	if (query)
		newState += "?s=" + query;
	
	window.history.pushState(query, '', newState);
	getLoadSceneUI()
}

window.addEventListener('popstate', getLoadSceneUI);

function onWindowResize() {

	if (core.camera) {
		core.camera.aspect = window.innerWidth / window.innerHeight;
		core.camera.updateProjectionMatrix();
	}
	core.renderer.setSize( window.innerWidth, window.innerHeight );

	core.render();
}

function presentBackInfo(sid, info) {
	const optVisInfo = document.createElement('div');
	const pageTitle = info.title + " - CodedCells 3D Scene Viewer";;
	document.title = pageTitle;
	document.getElementById("ogTitle").content = pageTitle;
	
	optVisInfo.innerHTML = `<h3>${info.title}</h3>`;
		
	if (info.post_ids && info.post_ids.length) {
		optVisInfo.innerHTML += "FA: ";
	
		for (var i = 0; i < info.post_ids.length; i++) {
			var d = info.post_ids[i];
			if (i > 0) optVisInfo.innerHTML += ", ";
			optVisInfo.innerHTML += `<a href="https://furaffinity.net/view/${d}/">${d}</a>`;
		}
	}
	return optVisInfo;
}

function presentBack(sid, abs) {
	const sceneMenu = document.getElementById("sceneMenu");
	sceneMenu.innerHTML = "";
	
	const sceneSelectDiv = document.createElement('div');
	sceneMenu.className = "menuBack";
	
	const optVis = document.createElement('div');
	
	optVis.className = "menuOption";
	optVis.id = "";
	
	const info = scenes[sid];
	if (!info) abs = true;
	
	if (abs) {
		// hacky because onclick fucking dies after 404
		const optVisTitle = document.createElement('a');
		optVisTitle.innerHTML = "< Back";
		optVisTitle.href = "/cc3d/sceneloader_nsfw.html";
		optVis.appendChild(optVisTitle);
		
		sceneSelectDiv.appendChild(optVis);
	} else {
		const optVisTitle = document.createElement('span');
		optVisTitle.innerHTML = "< Back";
		optVis.appendChild(optVisTitle);
		optVis.onclick = reload;
		sceneSelectDiv.appendChild(optVis);
	}
	
	if (info) {
		sceneSelectDiv.appendChild(presentBackInfo(sid, info));
	} else {
		sceneSelectDiv.innerHTML += `<br>An error, cannot find ${sid}`;
		if (parseInt(sid) >= 28747249)
			sceneSelectDiv.innerHTML += "<br>Perhaps wrong post ID?";
	}
	
	sceneMenu.appendChild(sceneSelectDiv);
}

function init() {

	const container = document.createElement( 'div' );
	document.body.appendChild( container );
	
	core.initialiseDefaultScene(container);
	
	window.addEventListener( 'resize', onWindowResize );
	
	fetchScenes();
}

function reverseSceneIDs() {
	for (var [name, data] of Object.entries(scenes)) {
		if (!data.post_ids) continue;
		for (var sid of Object.values(data.post_ids)) {
			sceneIds[sid] = name;
		}
	}
}

function preparseThis(loadThis) {
	if (loadThis in sceneIds)
		loadThis = sceneIds[loadThis];
	
	return loadThis;
}

function getLoadSceneUI() {
	var loadThis;
	
	if (window.location.search) {
		loadThis = preparseThis(window.location.search.substr(3));
		presentBack(loadThis)
	}
	else if (window.location.hash) {
		loadThis = preparseThis(window.location.hash.substr(1));
		presentBack(loadThis)
	}
	else if (window.location.pathname.includes("/s")) {
		loadThis = preparseThis(window.location.pathname.split("/")[3]);
		presentBack(loadThis, true)
	}
	
	if (!loadThis) {
		if (!core.sceneFile) loadThis = 'spin'
		presentLinks()
	}
	
	if (loadThis && loadThis != core.sceneFile) {
		//console.log("chaging to", loadThis);
		core.loadScene(loadThis)
	}
}

function fetchScenes() {
	fetch('/cc3d/scenes.json?v='+Math.random())
	.then(response => response.json()).catch(error => {
		console.error('Error fetching JSON:', error);
		if (fails++ < 6) {
			const x = setTimeout(fetchScenes, 500);
		} else {
			presentFail();
		}
	})
	.then(data => {
		// Call a function or do something with the JSON data
		scenes = data;
		reverseSceneIDs();
		getLoadSceneUI();
	});
}

function presentLink(sid, info, abs) {
	const optVis = document.createElement('a');
	
	optVis.className = "menuOption";
	optVis.id = sid;
	
	if (abs) optVis.href = `/cc3d/s/${sid}/`;
	else optVis.onclick = reload;
	
	const optVisTitle = document.createElement('span');
	
	var type = info.type;
	if (!type) type = "static";
	type = type.toLowerCase();
	
	optVisTitle.innerHTML += `<span class="mode-icon mode-icon-${type}"></span> `;
	
	optVisTitle.innerHTML += info.title;
	
	optVis.appendChild(optVisTitle);
	return optVis;
}

function sort_date(data) {
	return Object.keys(data).sort((a, b) => data[b].date - data[a].date);
}

function sort_title(data) {
	return Object.keys(data).sort((a, b) => {
		const titleA = data[a].title.toLowerCase();
		const titleB = data[b].title.toLowerCase();
		return titleA.localeCompare(titleB);
	});
}

function sort_type(data) {
	return Object.keys(data).sort((a, b) => {
		const titleA = (data[a].type + data[a].title).toLowerCase();
		const titleB = (data[b].type + data[b].title).toLowerCase();
		return titleA.localeCompare(titleB);
	});
}

function presentLinks() {
	const sceneMenu = document.getElementById("sceneMenu");
	sceneMenu.innerHTML = "";
	const sceneSelectDiv = document.createElement('div');
	sceneMenu.className = "menuMain";
	
	const divTitle = document.createElement('h2');
	divTitle.innerHTML = "Scene Loader";
	sceneSelectDiv.appendChild(divTitle);
	sceneSelectDiv.appendChild(linkDisp);
	sceneMenu.appendChild(sceneSelectDiv);
	
	presentOrderedLinks();
}

function sortScenesTrigger() {
	presentOrderedLinks(this.id);
}

function presentOrderedLinks(order) {
	linkDisp.innerHTML = "";
	
	if (!order) order = storedOrder;
	else storedOrder = order;
	
	const orderings = {
		"date": sort_date,
		"title": sort_title,
		"type": sort_type,
	}
	
	var ascending = false;
	if (!order) order = "date";
	else if (order.endsWith("_asc")) {
		ascending = true;
		order = order.substring(0, order.length - 4);
	}
	
	if (!order in orderings) {
		console.log(`Ordering "${order}" not supported, defaulting to name.`)
		order = "name";
	}
	
	const abs = window.location.pathname.includes("sceneloader_nsfw.html");
	
	var rx = 0;
	for (var [name] of Object.entries(orderings)) {
		var optVis = document.createElement('div');
		optVis.className = "orderOption";
		if (order == name && !ascending)
			optVis.className += " orderSelected";
		
		optVis.id = name;
		optVis.style.backgroundPositionX = `-${48 * rx++}px`;
		optVis.onclick = sortScenesTrigger;
		linkDisp.appendChild(optVis);
		
		var optVis = document.createElement('div');
		optVis.className = "orderOption";
		if (order == name && ascending)
			optVis.className += " orderSelected";
		
		optVis.id = name+"_asc";
		optVis.style.backgroundPositionX = `-${48 * rx++}px`;
		optVis.onclick = sortScenesTrigger;
		linkDisp.appendChild(optVis);
	}
	
	var listorder = orderings[order](scenes);
	
	if (ascending) listorder = listorder.reverse();
	
	for (var [i, sid] of Object.entries(listorder)) {
		const vis = presentLink(sid, scenes[sid], abs);
		linkDisp.appendChild(vis);
	}
	
	var optVis = document.createElement('a');
	
	optVis.className = "menuOption";
	optVis.href = "/cc3d/crafter/"
	
	const optVisTitle = document.createElement('span');
	
	optVisTitle.innerHTML += '<span class="mode-icon mode-icon-animated"></span> ';
	
	optVisTitle.innerHTML += "Crafter";
	
	optVis.appendChild(optVisTitle);
	
	linkDisp.appendChild(optVis);
}

init();