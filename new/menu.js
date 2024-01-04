import * as core from './core.js';

var fails = 0;
var scenes = {};
const linkDisp = document.createElement('span');

function reload() {
	// Reload the page
	var query = this.id;
	window.location.hash = "";
	if (query)
		query = "?s=" + query;
	
	window.location.search = query;
}

function onWindowResize() {

	if (core.camera) {
		core.camera.aspect = window.innerWidth / window.innerHeight;
		core.camera.updateProjectionMatrix();
	}
	core.renderer.setSize( window.innerWidth, window.innerHeight );

	core.render();
}

function presentBack() {
	const sceneMenu = document.getElementById("sceneMenu");
	const sceneSelectDiv = document.createElement('div');
	sceneMenu.className = "menuBack";
	
	const optVis = document.createElement('div');
	
	optVis.className = "menuOption";
	optVis.id = "";
	optVis.onclick = reload;
	
	const optVisTitle = document.createElement('span');
	optVisTitle.innerHTML = "< Back";
	optVis.appendChild(optVisTitle);
	sceneSelectDiv.appendChild(optVis);
	
	sceneMenu.appendChild(sceneSelectDiv);
}

function init() {

	const container = document.createElement( 'div' );
	document.body.appendChild( container );
	
	core.initialiseDefaultScene(container);
	
	var loadThis;
	
	if (window.location.search) {
		loadThis = window.location.search.substr(3);
		presentBack()
	}
	else if (window.location.hash) {
		loadThis = window.location.hash.substr(1);
		presentBack()
	} 
	
	if (!loadThis) {
		loadThis = 'spin'
		fetchScenes()
	}
	
	core.loadScene(loadThis + '.glb')
	
	window.addEventListener( 'resize', onWindowResize );
}

function fetchScenes() {
	fetch('scenes.json')
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
		presentLinks();
	});
}

function presentLink(sid, info) {
	const optVis = document.createElement('div');
	
	optVis.className = "menuOption";
	optVis.id = sid;
	optVis.onclick = reload;
	
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
	const entries = Object.entries(data);

	// Sort the array based on the date property
	entries.sort((a, b) => b[1].date - a[1].date);
	
	return entries.map(entry => entry[0]);
}

function sort_title(data) {
	const entries = Object.entries(data);

	// Sort the array based on the date property
	entries.sort((a, b) => a[1].title.toUpperCase() - b[1].title.toUpperCase());
	
	return entries.map(entry => entry[0]);
}

function sort_type(data) {
	const entries = Object.entries(data);

	// Sort the array based on the date property
	entries.sort((a, b) => a[1].type - b[1].type);
	
	return entries.map(entry => entry[0]);
}

function presentLinks() {
	const sceneMenu = document.getElementById("sceneMenu");
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
	
	const orderings = {
		"date": sort_date,
		//"title": sort_title,
		//"type": sort_type,
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
	
	order = orderings[order](scenes);
	
	if (ascending) order = order.reverse();
	
	for (var [i, sid] of Object.entries(order)) {
		const vis = presentLink(sid, scenes[sid]);
		linkDisp.appendChild(vis);
	}
}

init();