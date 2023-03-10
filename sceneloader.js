let isLocked = false;
let ready = false;

var scene;
var camera;
var fpscamera;
var renderer;
var canvas;
var sphere;
var mixer;
var clips;

var cameraPos = new THREE.Vector3();
var cameraRot = new THREE.Vector3();

var lastTime;

let forward = new THREE.Vector3();

function onResize () {
	camera.aspect = window.innerWidth / window.innerHeight;
	renderer.setSize( window.innerWidth, window.innerHeight );
	camera.updateProjectionMatrix();
	
	fpscamera.aspect = window.innerWidth / window.innerHeight;
	fpscamera.updateProjectionMatrix();
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

let lookX = 0, lookY = 0;
function onDocumentMouseMove(event) {
	if (isLocked) {
		mouseX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		mouseY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
		
		lookX -= mouseX * 0.002;
		lookY -= mouseY * 0.002;
		
		activecam.lookAt(new THREE.Vector3(
			activecam.position.x + Math.sin(lookX),
			activecam.position.y + lookY,
			activecam.position.z + Math.cos(lookX)
		));
	}
}

document.addEventListener('mousemove', onDocumentMouseMove, false);

var heldKeys = {"KeyW": false, "KeyA": false, "KeyS": false, "KeyD": false};
var freecam = false;
var activecam = camera;

function onDocumentKeyDown(event) {
	heldKeys[event.code] = true;
	if (event.code == "KeyR") {
		activecam.position.copy(cameraPos);
		activecam.quaternion.copy(cameraRot);
	}
	if (event.code == "Space") {
		freecam = !(freecam);
		if (freecam) activecam = fpscamera;
		else activecam = camera;
	}
}

function onDocumentKeyUp(event) {
	heldKeys[event.code] = false;
}

document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);

function animate(now) {
	requestAnimationFrame( animate );
	
	if (!lastTime) { lastTime = now; }
	
	var elapsed = now - lastTime;
	lastTime = now;
	
	forward.set(0, 0, -1).applyQuaternion(activecam.quaternion);
	if (heldKeys.KeyW) activecam.position.add(forward.multiplyScalar(0.1));
	if (heldKeys.KeyS) activecam.position.sub(forward.multiplyScalar(0.1));
	if (heldKeys.KeyA) activecam.position.sub(forward.cross(camera.up).normalize().multiplyScalar(0.1));
	if (heldKeys.KeyD) activecam.position.add(forward.cross(camera.up).normalize().multiplyScalar(0.1));

	if (ready) renderer.render( scene, activecam );
	
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
	activecam = camera;

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize( window.innerWidth, window.innerHeight );
	canvas = renderer.domElement;
	document.body.appendChild( canvas );
	
	fpscamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	fpscamera.position.y = 3;
	scene.add(fpscamera);
	
	ready = true;
}

document.onload = initial();

document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

function onDocumentMouseWheel(event) {
	activecam.fov += event.deltaY * 0.01;
	activecam.fov = Math.min(Math.max(activecam.fov, 1), 179)
	activecam.updateProjectionMatrix();
}

document.addEventListener("wheel", onDocumentMouseWheel, false);
canvas.addEventListener('click', clickEvent, false);

window.addEventListener('resize', onResize, false );

function importScene(data) {
	loader.style.display = "none";
	
	sceneData = data;
	scene = new THREE.ObjectLoader().parse( sceneData );
	camera = scene.children[0].children.find( child => child instanceof THREE.PerspectiveCamera );
	activecam = camera;
	
	mixer = new THREE.AnimationMixer(scene.children[0]);
	clips = scene.children[0].animations;
	console.log(clips);
	console.log(clips.length);
	
	clips.forEach( function ( clip ) {
		mixer.clipAction( clip ).play();
	} );
	cameraPos.copy(camera.position);
	cameraRot.copy(camera.quaternion);
	fpscamera.position.copy(camera.position);
	fpscamera.quaternion.copy(camera.quaternion);
	
	let cameraEuler = new THREE.Euler().setFromQuaternion(fpscamera.quaternion, 'XYZ');
	
	lookX = -cameraEuler.x * 360;
	lookY = -cameraEuler.y;
	
	scene.add(fpscamera);
	
	//let ambientLight = new THREE.AmbientLight(0xB1BEDD);
	//scene.add(ambientLight);
	
	onResize();
}

function loadScene(name) {
	loader.style.display = "initial";
	
	fetch("scenes/" + name + ".json")
		.then((response) => response.json())
		.then((json) => importScene(json));
}