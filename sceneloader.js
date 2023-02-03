let isLocked = false;
let ready = false;

var scene;
var camera;
var renderer;
var canvas;
var sphere;
var mixer;
var clips;

var lastTime;

function onResize () {
	camera.aspect = window.innerWidth / window.innerHeight;
	renderer.setSize( window.innerWidth, window.innerHeight );
	camera.updateProjectionMatrix();
}

const lockChangeAlert = () => {
	if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas) {
		isLocked = true;
	} else {
		isLocked = false;
	}
};

const clickEvent = (event) => {
	canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
	if (!isLocked) {
		canvas.requestPointerLock();
	}
};

const moveEvent = (event) => {
	if (isLocked) {
		const x = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		const y = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
	
		camera.rotation.y -= x * 0.002;
		camera.rotation.x -= y * 0.002;
	}
}

function animate(now) {
	requestAnimationFrame( animate );
	
	if (!lastTime) { lastTime = now; }
	
	var elapsed = now - lastTime;
	lastTime = now;
	
	if (ready) renderer.render( scene, camera );
	
	if (mixer) mixer.update(elapsed / 1000);
};

function initial() {
	basicScene();
	requestAnimationFrame( animate )
	
	if (window.location.hash.length > 1) {
		const [hash, query] = window.location.hash.split('#')[1].split('?')
		const params = Object.fromEntries(new URLSearchParams(query))
		
		loadScene(hash);
	}
}

function basicScene() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize( window.innerWidth, window.innerHeight );
	canvas = renderer.domElement;
	document.body.appendChild( canvas );
	ready = true;
}

document.onload = initial();

document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

function onDocumentMouseWheel(event) {
  camera.fov += event.deltaY * 0.01;
  camera.updateProjectionMatrix();
}

document.addEventListener("wheel", onDocumentMouseWheel, false);
canvas.addEventListener('click', clickEvent, false);
document.addEventListener('mousemove', moveEvent, false);

window.addEventListener('resize', onResize, false );

function importScene(data) {
	sceneData = data;
	scene = new THREE.ObjectLoader().parse( sceneData );
	camera = scene.children[0].children.find( child => child instanceof THREE.PerspectiveCamera );
	
	mixer = new THREE.AnimationMixer(scene.children[0]);
	clips = scene.children[0].animations;
	console.log(clips);
	console.log(clips.length);
	
	clips.forEach( function ( clip ) {
		mixer.clipAction( clip ).play();
	} );
	//scene.add(sphere);
	
	//let ambientLight = new THREE.AmbientLight(0xB1BEDD);
	//scene.add(ambientLight);
	
	onResize();
}

function loadScene(name) {
	fetch("scenes/" + name + ".json")
    .then((response) => response.json())
    .then((json) => importScene(json));
}