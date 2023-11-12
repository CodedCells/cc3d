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
	window.location.hash = this.id;
	window.location.reload();
}

function presentLinks() {
	const sceneMenu = document.getElementById("sceneMenu");
	const sceneSelectDiv = document.createElement('div');
	
	var sceneFiles = {
		"jungleheat": "Jungle Heat",
		"fexmilking": "Fex Milking",
		"ticklishvibedwarden": "Ticklish Vibed Warden",
		"chaltable": "Chal Table",
		"gimpfin": "Gimpfin",
		"bestowstrapona": "Bestow Strapon",
		"fexicebla": "Icee Huffy",
		"dragonbinds": "Dragon Binds"
	};
	
	const divTitle = document.createElement('h2');
	divTitle.innerHTML = "Temporary Menu";
	sceneSelectDiv.appendChild(divTitle);
	
	for (var [sid, name] of Object.entries(sceneFiles)) {
		
		const optVis = document.createElement('div');
		
		optVis.id = sid;
		optVis.onclick = reload;
		
		const optVisTitle = document.createElement('span');
		optVisTitle.innerHTML = name;
		optVis.appendChild(optVisTitle);
		sceneSelectDiv.appendChild(optVis);
	}
	sceneMenu.appendChild(sceneSelectDiv);
}

function presentBack() {
	const sceneMenu = document.getElementById("sceneMenu");
	const sceneSelectDiv = document.createElement('div');
	
	const optVis = document.createElement('div');
	
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
	
	//loadScene('gimpfin.glb')
	//loadScene('fexmilking.glb')
	var loadThis = 'spin';
	if (window.location.hash) {
		loadThis = window.location.hash.substr(1);
		presentBack()
	} else
		presentLinks()
	
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
				obj.material.alphaTest = 0.1;
			}
		});
		
		var orbitObject = model.getObjectByName("@orbit");
		if (orbitObject) {
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