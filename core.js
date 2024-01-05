import * as THREE from 'three';

import { OrbitControls } from './rip/OrbitControls.js';
import { GLTFLoader } from './rip/GLTFLoader.js';
import { RGBELoader } from './rip/RGBELoader.js';

export let camera, controls, scene, renderer, model, animations, mixer, orbitObject;
var lastTime;
export let sceneFile;
export var playSpeed = 1;

export function initialiseDefaultScene(c) {
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.toneMapping = THREE.LinearToneMapping ;
	renderer.toneMappingExposure = 1;
	c.appendChild( renderer.domElement );
}

export function loadScene(fn) {
	sceneFile = fn;
	if (!camera)
		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 500 );
	
	if (scene)
		scene.remove.apply(scene, scene.children);
	
	scene = new THREE.Scene();
	
	if (controls)
		controls.dispose();
	
	controls = new OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', render ); // use if there is no animation loop
	controls.minDistance = 0;
	controls.maxDistance = 30;
	
	// model
	const loader = new GLTFLoader().setPath( 'scenes/' );
	loader.load( fn + ".glb", function ( gltf ) {
		
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

function animate(now) {
	requestAnimationFrame(animate);
	if (!lastTime) { lastTime = now; }
	
	var elapsed = now - lastTime;
	lastTime = now;
	
	if (mixer && playSpeed > 0)
		mixer.update(elapsed / 1000 * playSpeed); // 'deltaTime' is the time difference between frames
	
	render();
}

export function render() {
	if (camera)
		renderer.render( scene, camera );
}