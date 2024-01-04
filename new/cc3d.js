import * as THREE from 'three';

import { OrbitControls } from './rip/OrbitControls.js';
import { GLTFLoader } from './rip/GLTFLoader.js';
import { RGBELoader } from './rip/RGBELoader.js';

//import * as Ab from './scenes.js';
//console.log(Ab.sceneFiles);

//Ab.showMenu(false);

let camera, scene, renderer, model, animations, mixer, orbitObject;
var lastTime;
var playSpeed = 1;

init();

function reload() {
	// Reload the page
	var query = this.id;
	window.location.hash = "";
	if (query)
		query = "?s=" + query;
	
	window.location.search = query;
}

function presentLinks() {
	const sceneMenu = document.getElementById("sceneMenu");
	const sceneSelectDiv = document.createElement('div');
	sceneMenu.className = "menuMain";
	
	var sceneFiles = {
		"2023": "2023",
		"cagebells": "cagebells",
		"dragonbinds": "Dragon Binds.",
		"feathervexa": "Feather Vex.",
		"fexmilking": "Fex Milking.",
		"gimpfin": "Gimpfin.",
		"kingdogz": "Kingdogz.",
		"labfins": "Musky Sauna Dolphins.",
		"ticklishvibedwarden": "Ticklish Vibed Warden.",
		"zombiestrongfisha": "Stronghold Silverfish x Zombie.",
		"bigbandet": "Big Bandet",
		"dorimedive": "Dorime Dive",
		"dragonsit": "Dragon Sit",
		"encore2021": "Encore 2021",
		"fexicebla": "Icee Huffy",
		"hogpet": "Hogpet",
		"jungleheat": "Jungle Heat",
		"llamadupe": "Llama Dupe",
		"mawholes": "Maw Holes",
		"ossierailed": "Ossie Railed",
		"parrottease": "Parrot Tease",
		"reflectionflip": "Reflection",
		"servicepets": "Service Pets",
		"sofameme": "Sofa Meme",
		"trotttrim": "Trott Trim",
		"bestowstrapona": "Bestow Strapon.",
		"chaltable": "Chal Table",
	};
	
	const divTitle = document.createElement('h2');
	divTitle.innerHTML = "Scene Loader Beta";
	sceneSelectDiv.appendChild(divTitle);
	sceneSelectDiv.innerHTML += '<span class="blah">Star icon = animation</span>';
	
	for (var [sid, name] of Object.entries(sceneFiles)) {
		
		const optVis = document.createElement('div');
		
		optVis.className = "menuOption";
		optVis.id = sid;
		optVis.onclick = reload;
		
		const optVisTitle = document.createElement('span');
		if (name.endsWith('.')) {
			name = name.substring(0, name.length - 1);
			optVisTitle.innerHTML += '<span class="anim-icon">ANIMATED</span> ';
		}
		optVisTitle.innerHTML += name;
		
		optVis.appendChild(optVisTitle);
		sceneSelectDiv.appendChild(optVis);
	}
	sceneMenu.appendChild(sceneSelectDiv);
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
	
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.toneMapping = THREE.LinearToneMapping ;
	renderer.toneMappingExposure = 1;
	container.appendChild( renderer.domElement );
	
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
		presentLinks()
	}
	
	loadScene(loadThis + '.glb')
	
	window.addEventListener( 'resize', onWindowResize );

}

function loadScene(fn) {
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 500 );
	//camera.position.set( - 1.8, 0.6, 2.7 );

	scene = new THREE.Scene();
	
	const controls = new OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', render ); // use if there is no animation loop
	controls.minDistance = 0;
	controls.maxDistance = 30;
	
	// model
	const loader = new GLTFLoader().setPath( 'scenes/' );
	loader.load( fn, function ( gltf ) {
		
		// this magical placement of the function
		animate();
		// makes it all work
		// all hail chatgpt debugging
		// do not move it lest ye turn to stone
		
		model = gltf.scene;
		
		model.traverse((obj) => {
			if (obj.isMesh) {
				obj.renderOrder = 0; // Set render order
				obj.material.depthWrite = true; // Enable depth writing for the material
				obj.material.alphaTest = 0.05;
				
				if (obj.material.map)
					obj.material.map.minFilter = THREE.LinearFilter;
			}
		});
		
		var orbitObject = model.getObjectByName("@orbit");
		if (orbitObject) {
			console.log(orbitObject.userData);
			if (orbitObject.userData.ambientLight) {
				var ambientLightColor = new THREE.Color("#" + orbitObject.userData.ambientLight);
				var ambientLight = new THREE.AmbientLight(ambientLightColor, 0.8);
				scene.add(ambientLight);
			}
			if (orbitObject.userData.sky) {
				var skyTextureName = "skies/" + orbitObject.userData.sky + ".jpg";
				var textureLoader = new THREE.TextureLoader();
				var skyTexture = textureLoader.load(skyTextureName);
				skyTexture.colorSpace = THREE.SRGBColorSpace;
				console.log(skyTexture);
				skyTexture.mapping = THREE.EquirectangularReflectionMapping;

				scene.background = skyTexture;
			}
		
			orbitObject = orbitObject.position;
			controls.target.set( orbitObject.x, orbitObject.y, orbitObject.z );
		}
		else
			controls.target.set( 0, 1.6, 0 );
		
		controls.update();
		
		animations = gltf.animations;
		mixer = new THREE.AnimationMixer(model); // Assuming 'model' is your GLTF scene
		
		animations.forEach((clip) => {
			mixer.clipAction(clip).play();
		});
		
		mixer.update(0);
		
		const gltfCamera = gltf.cameras[0];
		camera.position.copy(gltfCamera.position);
		camera.rotation.copy(gltfCamera.rotation);
		camera.fov = gltfCamera.fov;
		camera.updateProjectionMatrix();
		
		// wait until the model can be added to the scene without blocking due to shader compilation
		scene.add( model );
	} );
}

function onWindowResize() {

	if (camera) {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}
	renderer.setSize( window.innerWidth, window.innerHeight );

	render();

}

function animate(now) {
	requestAnimationFrame(animate);
	if (!lastTime) { lastTime = now; }
	
	var elapsed = now - lastTime;
	lastTime = now;
	
	if (mixer && playSpeed > 0)
		mixer.update(elapsed / 1000 * playSpeed); // 'deltaTime' is the time difference between frames
	
	render();
}

function render() {
	if (camera)
		renderer.render( scene, camera );
}