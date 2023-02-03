let isLocked = false;
let ready = false;

var scene;
var camera;
var renderer;
var canvas;
var sphere;

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

function animate() {
	requestAnimationFrame( animate );
	if (ready) {
		renderer.render( scene, camera );
	}
};

function initial() {
	basicScene();
	animate();
}

function basicScene() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize( window.innerWidth, window.innerHeight );
	canvas = renderer.domElement;
	document.body.appendChild( canvas );

	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	var cube = new THREE.Mesh( geometry, material );
	scene.add( cube );
	/*
	let texture = new THREE.Texture();
	const image = new Image();
	image.src = 'junglehat_panof.jpg';
	image.onload = function() {
		createImageBitmap(image).then(function(imageBitmap) {
			texture.image = imageBitmap;
			texture.needsUpdate = true;
			ready = true;
	  });
	};
	
	let sphereGeometry = new THREE.SphereGeometry(100, 32, 32);
	sphereGeometry.scale(1, -1, 1);
	let sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
	sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
	scene.add(sphere);
	*/
	camera.position.z = 5;
	ready = true;
}

document.onload = initial();

document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

canvas.addEventListener('click', clickEvent, false);
document.addEventListener('mousemove', moveEvent, false);

window.addEventListener('resize', onResize, false );

function loadScene(name) {
	const script = document.createElement('script');
	script.async = true;
	script.onload = importScene;
	script.src = name + ".js";
	document.body.appendChild(script);
}

function importScene() {
	scene = new THREE.ObjectLoader().parse( sceneData );
	camera = scene.children[0].children.find( child => child instanceof THREE.PerspectiveCamera );
	//scene.add(sphere);
	
	//let ambientLight = new THREE.AmbientLight(0xB1BEDD);
	//scene.add(ambientLight);
	
	onResize();
}