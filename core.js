import * as THREE from 'three';

import {OrbitControls} from './rip/OrbitControls.js';
import {GLTFLoader} from './rip/GLTFLoader.js';
import {RGBELoader} from './rip/RGBELoader.js';
import Stats from './rip/stats.module.js';

export let sceneReady, camera, controls, scene, renderer, model, animations, mixer, orbitObject, stats;
var lastTime;
export let sceneFile;
export let playSpeed = 1;
export let playPaused = false;
sceneReady = false;
var applicationReadyFlag = true;

export function setPlaySpeed(value) {
	playSpeed = value;
}

export function togglePause() {
	playPaused = !playPaused;
	return playPaused;
}

export function applicationReady(value) {
	applicationReadyFlag = value;
}

export function setPixelRatio(v) {
	renderer.setPixelRatio(v);
}

export function initialiseDefaultScene(c) {
	const quality = localStorage.getItem('quality') || 'high';
	
	let antialias = (quality === 'high');
	let pixelRatio = (quality === 'low') ? 0.5 : window.devicePixelRatio;
	
	renderer = new THREE.WebGLRenderer({ antialias: antialias });
	renderer.setPixelRatio(pixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.toneMapping = THREE.LinearToneMapping;
	renderer.toneMappingExposure = 1;
	
	if (quality === 'low') {
		renderer.shadowMap.enabled = false;
	}
	
	c.appendChild(renderer.domElement);
}

function loaderReady(gltf) {
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

		var ambient = orbitObject.userData.ambientLight;
		if (!ambient)
			ambient = "404047";

		var ambientIntensity = orbitObject.userData.ambientIntensity;
		if (!ambientIntensity)
			ambientIntensity = 0.8;

		var ambientLightColor = new THREE.Color("#" + ambient);
		var ambientLight = new THREE.AmbientLight(ambientLightColor, ambientIntensity);
		scene.add(ambientLight);

		if (orbitObject.userData.sky) {
			var skyTextureName = "/cc3d/skies/" + orbitObject.userData.sky + ".jpg";
			var textureLoader = new THREE.TextureLoader();
			var skyTexture = textureLoader.load(skyTextureName);
			skyTexture.colorSpace = THREE.SRGBColorSpace;
			skyTexture.mapping = THREE.EquirectangularReflectionMapping;

			scene.background = skyTexture;
		}

		orbitObject = orbitObject.position;
		controls.target.set(orbitObject.x, orbitObject.y, orbitObject.z);
	} else
		controls.target.set(0, 1.6, 0);

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
	scene.add(model);
	sceneReady = true;
}

export function loadScene(fn, path, hash) {
	sceneReady = false;
	if (!stats) {
		stats = new Stats();
		stats.domElement.style.left = null;
		stats.domElement.style.right = "0";
		document.body.appendChild(stats.dom);
	}
	if (hash === undefined)
		hash = Math.random()

	sceneFile = fn;
	
	if (!camera)
		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 500);

	if (scene)
		scene.remove.apply(scene, scene.children);

	scene = new THREE.Scene();

	if (controls)
		controls.dispose();

	playSpeed = 1;
	playPaused = false;
	
	controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener('change', render); // use if there is no animation loop
	controls.minDistance = 0;
	controls.maxDistance = 30;

	if (path === undefined)
		path = '/cc3d/scenes/';
	
	// model
	const loader = new GLTFLoader().setPath(path);
	loader.load(fn + ".glb?v=" + hash, loaderReady,
	function(xhr) {
		// This function will be called while the model is loading, you can use it for progress updates if needed
		//console.log(xhr.loaded, xhr.total);
	},
	function(error) {
		// Handle errors, including 404 Not Found
		if (fn != 'spin')
			loadScene("error");
		
		if (error.status === 404)
			console.error('Model not found: ' + modelUrl);
		else
			console.error('Error loading model:', error);
	}
	);
}

function animate(now) {
	requestAnimationFrame(animate);
	if (!lastTime) {
		lastTime = now;
	}

	var elapsed = now - lastTime;
	lastTime = now;

	if (mixer && playSpeed > 0 && !playPaused)
		mixer.update(elapsed / 1000 * playSpeed); // 'deltaTime' is the time difference between frames

	render();
}

export function setQuality(quality) {
	localStorage.setItem('quality', quality);
	location.reload(); 
}

function showLowFpsWarning() {
	const popup = document.createElement('div');
	popup.style.position = 'absolute';
	popup.style.top = '10px';
	popup.style.right = '10px';
	popup.style.padding = '10px';
	popup.style.backgroundColor = 'rgba(0,0,0,0.8)';
	popup.style.color = 'white';
	popup.style.zIndex = 1000;
	popup.innerHTML = `
		Low performance detected.<br/>
		<a href="#" id="reduceQuality">Click here to lower quality</a>
	`;
	document.body.appendChild(popup);

	document.getElementById('reduceQuality').onclick = function(e) {
		e.preventDefault();
		setQuality('low')
	};
}

let frameTimes = [];
let lowFpsWarningShown = false;

function render() {
	if (!camera) return;
	
	sceneReady = true;
	if (!applicationReadyFlag) return;
	
	stats.begin();
	renderer.render(scene, camera);
	stats.end();
	
	// Track framerate
	const now = performance.now();
	frameTimes.push(now);
	while (frameTimes.length > 0 && frameTimes[0] < now - 2000) {
		frameTimes.shift();
	}
	
	const fps = frameTimes.length / 2;
	if (frameTimes.length > 60 && fps < 20 && !lowFpsWarningShown) {
		showLowFpsWarning();
		lowFpsWarningShown = true;
	}
}