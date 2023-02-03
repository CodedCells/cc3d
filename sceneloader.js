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
let mouseX = 0, mouseY = 0;
let velocity = new THREE.Vector3();

function onDocumentMouseMove(event) {
	if (isLocked) {
		mouseX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		mouseY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
		
		lookX -= mouseX * 0.002;
		lookY -= mouseY * 0.002;
		
		fpscamera.lookAt(new THREE.Vector3(
			fpscamera.position.x + Math.sin(lookX),
			fpscamera.position.y + lookY,
			fpscamera.position.z + Math.cos(lookX)
		));
	}
}

document.addEventListener('mousemove', onDocumentMouseMove, false);

function onDocumentKeyDown(event) {
	switch (event.code) {
		case 'KeyW':
			velocity.z = -0.05;
			break;
		case 'KeyS':
			velocity.z = 0.05;
			break;
		case 'KeyA':
			velocity.x = -0.05;
			break;
		case 'KeyD':
			velocity.x = 0.05;
			break;
	}
}

document.addEventListener('keydown', onDocumentKeyDown, false);

function animate(now) {
	requestAnimationFrame( animate );
	
	if (!lastTime) { lastTime = now; }
	
	var elapsed = now - lastTime;
	lastTime = now;
	
	fpscamera.position.x += velocity.x;
	fpscamera.position.z += velocity.z;
	velocity.set(0, 0, 0);
  
	if (ready) renderer.render( scene, fpscamera );
	
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
	fpscamera.fov += event.deltaY * 0.01;
	fpscamera.fov = Math.min(Math.max(fpscamera.fov, 1), 179)
	fpscamera.updateProjectionMatrix();
}

document.addEventListener("wheel", onDocumentMouseWheel, false);
canvas.addEventListener('click', clickEvent, false);

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
	fpscamera.position.copy(camera.position);
	fpscamera.quaternion.copy(camera.quaternion);
	fpscamera.fov = camera.fov;
	lookX = camera.rotation.x;
	lookY = camera.rotation.y;
	
	scene.add(fpscamera);
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