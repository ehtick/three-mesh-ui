
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import ThreeMeshUI from 'three-mesh-ui';
import VRControl from 'three-mesh-ui/examples/controls/VRControl.js';
import InteractiveRaycaster from "three-mesh-ui/examples/interactive/InteractiveRaycaster";

import Button from "three-mesh-ui/examples/interactive/Button";

import ShadowedLight from './utils/ShadowedLight.js';

import FontJSON from './assets/Roboto-msdf.json';
import FontImage from './assets/Roboto-msdf.png';

let scene, camera, renderer, controls, vrControl, interactiveRaycaster;
let meshContainer, meshes, currentMesh;

window.addEventListener( 'load', init );
window.addEventListener('resize', onWindowResize );

//

function init() {

	////////////////////////
	//  Basic Three Setup
	////////////////////////

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x505050 );

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.xr.enabled = true;
	document.body.appendChild( VRButton.createButton(renderer) );
	document.body.appendChild( renderer.domElement );

	// Orbit controls for no-vr

	controls = new OrbitControls( camera, renderer.domElement );
	camera.position.set( 0, 1.6, 0 );
	controls.target = new THREE.Vector3( 0, 1, -1.8 );

	/////////
	// Room
	/////////

	const room = new THREE.LineSegments(
        new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ).translate( 0, 3, 0 ),
		new THREE.LineBasicMaterial( { color: 0x808080 } )
	);

	const roomMesh = new THREE.Mesh(
		new THREE.BoxGeometry( 6, 6, 6, 10, 10, 10 ).translate( 0, 3, 0 ),
		new THREE.MeshBasicMaterial({ side: THREE.BackSide }),
	);

	scene.add( room );

    // @TODO: Can you point out why this should be required?
    //objsToTest.push(roomMesh);

	//////////
	// Light
	//////////

	const light = ShadowedLight({
		z: 10,
		width: 6,
		bias: -0.0001
	});

	const hemLight = new THREE.HemisphereLight( 0x808080, 0x606060 );

	scene.add( light, hemLight );

	////////////////
	// Controllers
	////////////////

	vrControl = VRControl( renderer, camera, scene );
	scene.add( vrControl.controllerGrips[ 0 ], vrControl.controllers[ 0 ] );

    ////////////////
    // Raycaster
    ////////////////

    interactiveRaycaster = new InteractiveRaycaster( camera, renderer, vrControl );

    ////////////////////
	// Primitive Meshes
	////////////////////

	meshContainer = new THREE.Group();
	meshContainer.position.set( 0, 1, -1.9 );
	scene.add( meshContainer );

	//

	const sphere = new THREE.Mesh(
		new THREE.IcosahedronBufferGeometry( 0.3, 1 ),
		new THREE.MeshStandardMaterial({ color: 0x3de364, flatShading: true })
	);

	const box = new THREE.Mesh(
		new THREE.BoxBufferGeometry( 0.45, 0.45, 0.45 ),
		new THREE.MeshStandardMaterial({ color: 0x643de3, flatShading: true })
	);

	const cone = new THREE.Mesh(
		new THREE.ConeBufferGeometry( 0.28, 0.5, 10 ),
		new THREE.MeshStandardMaterial({ color: 0xe33d4e, flatShading: true })
	);

	//

	sphere.visible = box.visible = cone.visible = false;

	meshContainer.add( sphere, box, cone );

	meshes = [ sphere, box, cone ];
	currentMesh = 0;

	showMesh( currentMesh );

 	//////////
	// Panel
	//////////

	makePanel();

	//

	renderer.setAnimationLoop( loop );

};

// Shows the primitive mesh with the passed ID and hide the others

function showMesh( id ) {

	meshes.forEach( (mesh, i)=> {
		mesh.visible = i === id ? true : false;
	});

};

function prevMesh( evt ){

    currentMesh -= 1;
    if (currentMesh < 0) currentMesh = 2;
    showMesh(currentMesh);
}

function nextMesh( evt ){

    currentMesh = (currentMesh + 1) % 3;
    showMesh(currentMesh);
}

///////////////////
// UI contruction
///////////////////

function makePanel() {

    const panel = new ThreeMeshUI.Block({
        justifyContent: 'center',
        alignContent: 'center',
        contentDirection: 'column',
        fontFamily: FontJSON,
        fontTexture: FontImage,
        fontSize: 0.07,
        padding: 0.02,
        backgroundOpacity: 0
    });

    panel.position.set( 0, 0.6, -1.2 );
    panel.rotation.x = -0.55;
    scene.add( panel );

    // BUTTONS with default styles

    // Container block, in which we put the two buttons.
    // We don't define width and height, it will be set automatically from the children's dimensions
    // Note that we set contentDirection: "row-reverse", in order to orient the buttons horizontally

    const container = new ThreeMeshUI.Block({
        justifyContent: 'center',
        alignContent: 'center',
        contentDirection: 'row',
        fontFamily: FontJSON,
        fontTexture: FontImage,
        fontSize: 0.07,
        padding: 0.02,
        borderRadius: 0.05
    });


    // Button has default settings to fasten its uses
    const buttonPrevious = new Button({label: "Prev"});
    buttonPrevious.addEventListener('click', prevMesh );


    //
    const buttonNext = new Button({label: "Next"});
    buttonNext.addEventListener('click', nextMesh );

    container.add( _textBlock("Default Styles") , buttonPrevious, buttonNext );
    interactiveRaycaster.addObject( buttonPrevious, buttonNext );

    panel.add( container );


    // BUTTONS with customized styles

    const containerStyle = new ThreeMeshUI.Block({
        justifyContent: 'center',
        alignContent: 'center',
        contentDirection: 'row',
        fontFamily: FontJSON,
        fontTexture: FontImage,
        fontSize: 0.07,
        padding: 0.02,
        margin: 0.025,
        borderRadius: 0.05
    });

    const buttonOptions = {
        borderRadius: 0.025,
        height: 0.12,
        states: {
            idle: {
                backgroundColor: new THREE.Color(0x0099FF),
                backgroundOpacity: 1,
                fontColor: new THREE.Color(0xFFFFFF),
                offset: 0.02
            },
            hovered:{
                backgroundColor: new THREE.Color(0x00CCFF),
                backgroundOpacity: 1,
                fontColor: new THREE.Color(0xFFFFFF),
                offset: 0.02
            },
            selected:{
                backgroundColor: new THREE.Color(0xFFFFFF),
                backgroundOpacity: 1,
                fontColor: new THREE.Color(0x0099FF),
                offset: 0.01
            }
        }
    }

    // Button can customize its settings
    const customButtonPrev = new Button({label:"Prev", ...buttonOptions});
    const customButtonNext = new Button({label:"Next", ...buttonOptions});

    // interactions
    customButtonPrev.addEventListener('click', prevMesh );
    customButtonNext.addEventListener('click', nextMesh );

    containerStyle.add( _textBlock("Custom Styles"), customButtonPrev, customButtonNext );
    interactiveRaycaster.addObject( customButtonPrev, customButtonNext );

    panel.add(containerStyle);

};


function _textBlock(title){
    const block = new ThreeMeshUI.Block({
        width:0.65,
        height:0.15,
        fontSize:0.05,
        justifyContent: 'center',
        backgroundOpacity: 0
    });
    block.add( new ThreeMeshUI.Text({content:title}));
    return block;
}

// Handle resizing the viewport

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
};

//

function loop() {

    // Don't forget, ThreeMeshUI must be updated manually.
    // This has been introduced in version 3.0.0 in order
    // to improve performance
    ThreeMeshUI.update();

    controls.update();

    meshContainer.rotation.z += 0.01;
    meshContainer.rotation.y += 0.01;

    renderer.render( scene, camera );

    interactiveRaycaster.update();

};
