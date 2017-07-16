/* global THREE, SimplexNoise, Stats, ATUtil, dat, window, document, requestAnimationFrame */

import '../libs/jquery-2.0.0.min.js';
import '../libs/three.min.js';

import ATUtil from '../libs/atutil.js';
import Stats from '../libs/stats.js';
import dat from '../libs/dat.gui.min.js';

import SimplexNoise from '../libs/SimplexNoise.js';

import '../libs/TrackballControls.js';
import '../libs/CopyShader.js';
import '../libs/FXAAShader.js';
import '../libs/RenderPass.js';
import '../libs/ShaderPass.js';
import '../libs/MaskPass.js';
import '../libs/EffectComposer.js';
import '../libs/SuperShader.js';




import React from 'react';


let context,
    source,
    sourceJs,
    analyser,
    boost = 0;

class Ribbons extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            audioData: props.audioData,
        };
    }

    componentDidMount() {
		this.playRibbons();
    }

    componentDidUpdate() {

    }

    getBoost() {
        return this.props.audioData;
    }

    /**
     * //TODO: ES6
     */
    playRibbons() {
    var boost = 0;

	boost = setInterval(
		() => this.getBoost(),
		10
	);

    var camera, scene, renderer;

    var composer, fxaaPass;
    var stats, controls;

    var BOUNDS = 1000; //bounded space goes from - BOUNDS to +BOUNDS

    var RIBBON_COUNT = 600;
    var ribbons = [];

    var EMITTER_COUNT = 3;
    var emitters = [];

    var noise = new SimplexNoise();
    var noiseTime = Math.random()*1000;

    var worldHolder;
    var boundsMesh;


    var up = new THREE.Vector3(0,1,0);
    var vec = new THREE.Vector3();
    var tangent = new THREE.Vector3();
    var normal = new THREE.Vector3();
    var col = new THREE.Color();

    var guiParams = {
        noiseSpeed: 0.001,
        noiseScale: 1200,
        noiseSeparation:0.1,
        ribbonSpeed:1,
        usePostProc : false,
        showBounds : false,
        autoRotate: true,

        ribbonWidth:6,
        startRange: 100,
        clumpiness: 0.8

    };

    function init() {

        if ($('.dg').length) {
            $('.dg').remove();
        }

        //INIT DAT GUI
        var gui = new dat.GUI();
        gui.add(guiParams, 'noiseScale', 100, 5000).name('Turbulence');
        gui.add(guiParams, 'noiseSpeed', 0, 0.01).name('Variance');
        gui.add(guiParams, 'noiseSeparation', 0, 0.5).name('Cohesion');
        gui.add(guiParams, 'ribbonSpeed', 0.1, 5).name('Speed');
        gui.add(guiParams, 'usePostProc').name('Post Processing');
        gui.add(guiParams, 'showBounds').name('Show Bounds');
        gui.add(guiParams, 'autoRotate').name('Auto Rotate');
        gui.close();

        // gui.add(guiParams, 'startRange', 1, 600);
        // gui.add(guiParams, 'clumpiness', 0, 1);
        // gui.add(guiParams, 'ribbonWidth', 1, 20).name('Ribbon Width');

        // $('body').css('background-image', 'data/006.jpg'); //#eaeaea
        // $('.dg').css('display', 'none');

        //INIT THREEJS WORLD
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 1000;
        scene = new THREE.Scene();
        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize( window.innerWidth, window.innerHeight );
        worldHolder = new THREE.Object3D();
        scene.add(worldHolder);

        var light = new THREE.AmbientLight(0x505050);
        scene.add(light);

        //STATS
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        // document.body.appendChild( stats.domElement );

        setTimeout(function() {


            // $('#audioValue').on("change paste keyup", function() {
            //     boost = $('#audioValue').val();
            //     console.log('>>>>>boost', boost);
            // });

            // console.log('is it?', $('#ribbons').length);
            $('#ribbons').append( renderer.domElement );
            $('#ribbons').css('background', 'url(data/006.jpg)');
            // $('#empire-sounds').append( stats.domElement  );
        }, 100);

        //TRACKBALL CONTROLS
        controls = new THREE.TrackballControls( camera , renderer.domElement );

        //CREATE EMITTERS
        for (var i = 0; i < EMITTER_COUNT; i++) {
            emitters[i] = ATUtil.randomVector3(BOUNDS/2);
        }

        //CREATE RIBBONS
        for (i = 0; i < RIBBON_COUNT; i++) {
            var r = new Ribbon();
            r.init();
            worldHolder.add(r.mesh);
            ribbons.push(r);
        }

        //ADD STARS
        var starGeometry = new THREE.Geometry();
        for ( i = 0; i < 800; i ++ ) {
            starGeometry.vertices.push(ATUtil.randomVector3(BOUNDS));
        }
        var starTexture = THREE.ImageUtils.loadTexture( 'dot.png' );
        var starMaterial = new THREE.PointsMaterial({
            size: 10,
            map: starTexture,
            blending: THREE.AdditiveBlending,
            //depthTest: false,
            transparent: true,
            opacity:0.6
        });
        var stars = new THREE.Points( starGeometry, starMaterial );
        worldHolder.add(stars);

        //ADD BOUNDS BOX
        var boundsMaterial = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } );
        var boundsGeom  = new THREE.BoxGeometry( BOUNDS*2, BOUNDS*2, BOUNDS*2 );
        boundsMesh = new THREE.Mesh( boundsGeom, boundsMaterial );
        worldHolder.add( boundsMesh );

        window.addEventListener( 'resize', onResize, false );

        initPostprocessing();

        animate();

    }

    function initPostprocessing() {

        //create passes
        var renderPass = new THREE.RenderPass( scene, camera );

        //FXAA smooths out jaggies
        fxaaPass = new THREE.ShaderPass( THREE.FXAAShader );
        //SuperPass adds glow and vignette
        var superPass = new THREE.ShaderPass( THREE.SuperShader );
        superPass.renderToScreen = true;

        //set uniforms
        fxaaPass.uniforms.resolution.value = new THREE.Vector2(1/window.innerWidth, 1/window.innerHeight);
        superPass.uniforms.glowSize.value = 2;

        //Add passes to composer
        composer = new THREE.EffectComposer( renderer );
        composer.addPass( renderPass );
        composer.addPass( fxaaPass );
        composer.addPass( superPass );
    }

    function animate() {

        requestAnimationFrame( animate );
        noiseTime += guiParams.noiseSpeed;

        for (var i = 0; i < RIBBON_COUNT; i++) {
            ribbons[i].update();
        }

        controls.update();
        stats.update();

        if (guiParams.usePostProc){
            composer.render();
        }else{
            renderer.render( scene, camera );
        }

        if (guiParams.autoRotate){
            worldHolder.rotation.y += 0.001;
            worldHolder.rotation.x += 0.001;
        }

        boundsMesh.visible = guiParams.showBounds;
    }

    function onResize() {
        var w = window.innerWidth;
        var h = window.innerHeight;
        camera.aspect =  w / h;
        camera.updateProjectionMatrix();
        renderer.setSize( w,h );
        fxaaPass.uniforms.resolution.value = new THREE.Vector2(1/w, 1/h);
        composer.setSize(w,h );
    }


//////////////////////////////////
//RIBBON OBJECT
//////////////////////////////////

// Ribbon is composed of a head and a tail - 2 3D vectors.
// the head is moved around via a 4D noise field. The tail follows it one frame later.
// The visible ribbon is a custom built mesh. Each frame the left and right edges
// of the ribbon are constructed by using the normals on the vector between the head
// and tail. The mesh is constructed by copying the edge vertices back along the
// tail of the mesh. This way no new vector3s are created each frame, only copying
// between vectors, preventing memory thrashing. Temp vectors are used for calculations.


    var Ribbon = function(){

        this.init = function(){

            this.LEN = 40; //number of spine points

            this.velocity = new THREE.Vector3();
            this.speed = ATUtil.randomRange(0.1, 0.5);
            this.ribbonWidth = ATUtil.randomRange(2,12);

            //head is the thing that moves, tail follows behind
            this.head = new THREE.Vector3();
            this.tail = new THREE.Vector3();

            //ADD MESH
            this.meshGeom = this.createMeshGeom();
            this.reset();
            this.meshMaterial = new THREE.MeshBasicMaterial( {
                side: THREE.DoubleSide,
                vertexColors:THREE.FaceColors,
                wireframe: false
            } );

            this.mesh = new THREE.Mesh( this.meshGeom, this.meshMaterial );

        };

        this.createMeshGeom = function(){

            //make geometry, faces & colors for a ribbon
            var i;
            var geom = new THREE.Geometry();
            geom.vertexColors = [];

            //create verts + colors
            for ( i = 0; i < this.LEN; i ++ ) {
                geom.vertices.push(new THREE.Vector3());
                geom.vertices.push(new THREE.Vector3());
                geom.vertexColors.push(new THREE.Color());
                geom.vertexColors.push(new THREE.Color());
            }

            //create faces
            for ( i = 0; i < this.LEN-1; i ++ ) {
                geom.faces.push( new THREE.Face3(i*2,i*2+1,i*2+2));
                geom.faces.push( new THREE.Face3(i*2+1,i*2+3,i*2+2));
            }
            return geom;
        };

        this.reset = function(){

            //reset a ribbon back to an emitter
            var i;
            this.id = Math.random()*guiParams.noiseSeparation;

            //move head and tail to an emitter or randomly in bounds
            if (Math.random() < guiParams.clumpiness){
                var emitterId = ATUtil.randomInt(0,EMITTER_COUNT-1);
                this.head.addVectors(emitters[emitterId],ATUtil.randomVector3(guiParams.startRange));
            }else{
                this.head.copy(ATUtil.randomVector3(BOUNDS));
            }

            //reset tail position
            this.tail.copy(this.head);

            //reset mesh geom
            for ( i = 0; i < this.LEN; i ++ ) {
                this.meshGeom.vertices[i*2].copy(this.head);
                this.meshGeom.vertices[i*2+1].copy(this.head);
            }

            //init colors for this ribbon
            //hue is set by start x position
            var hue = (this.head.x /(BOUNDS/2)) /2 + 0.5;
            if (Math.random() < 0.1)  hue = Math.random();
            // var sat = ATUtil.randomRange(0.6,1);
            var sat = 0;
            var lightness = ATUtil.randomRange(0.2,0.6);

            for ( i = 0; i < this.LEN-1; i ++ ) {
                //add lightness gradient based on spine position
                col.setHSL( hue, sat, (1 - i/ this.LEN) * lightness/4 + lightness* 3/4 );
                this.meshGeom.faces[i*2].color.copy(col);
                this.meshGeom.faces[i*2+1].color.copy(col);
            }

            this.meshGeom.verticesNeedUpdate = true;
            this.meshGeom.colorsNeedUpdate = true;

        };

        this.update = function(){

            //MOVE HEAD

            this.tail.copy(this.head);

            //move head via noisefield
            //3 noisefields one for each axis (using offset of 50 to create new field)
            //3D noisefield is a greyscale 3D cloud with values varying from -1 to 1
            //4th dimension is time to make cloud change over time

            vec.copy(this.head).divideScalar(guiParams.noiseScale);

            // this.velocity.x = noise.noise4d(vec.x, vec.y, vec.z, 0  + boost + this.id ) * this.speed * boost/10;
            // this.velocity.y = noise.noise4d(vec.x, vec.y, vec.z, 50 + boost + this.id ) * this.speed * boost/10;
            // this.velocity.z = noise.noise4d(vec.x, vec.y, vec.z, 100+ boost + this.id ) * this.speed * boost/10;
            //
            this.velocity.x = noise.noise4d(vec.x, vec.y, vec.z, 0  + noiseTime + this.id ) * this.speed * boost;
            this.velocity.y = noise.noise4d(vec.x, vec.y, vec.z, 50 + noiseTime + this.id ) * this.speed * boost;
            this.velocity.z = noise.noise4d(vec.x, vec.y, vec.z, 100+ noiseTime + this.id ) * this.speed * boost;

            this.head.add(this.velocity);

            //reset if Out Of Bounds
            if (this.head.x > BOUNDS || this.head.x < -BOUNDS ||
                this.head.y > BOUNDS || this.head.y < -BOUNDS ||
                this.head.z > BOUNDS || this.head.z < -BOUNDS ) {
                this.reset();
            }

            //UPDATE MESH GEOM

            //add 2 new verts onto the end of the mesh geometry
            //rather than push and pop we copy each vert into the previous one
            //to prevent memory thrashing

            //calc new L + R edge positions from tangent between head and tail
            tangent.subVectors(this.head,this.tail).normalize();
            vec.crossVectors( tangent, up ).normalize();
            normal.crossVectors( tangent, vec );
            normal.multiplyScalar(this.ribbonWidth);

            //shift each 2 verts down one posn
            //e.g. copy verts (0,1) -> (2,3)
            for ( var i = this.LEN - 1; i > 0; i -- ) {
                this.meshGeom.vertices[i*2].copy(this.meshGeom.vertices[(i-1)*2]);
                this.meshGeom.vertices[i*2+1].copy(this.meshGeom.vertices[(i-1)*2+1]);
            }

            //populate 1st 2 verts with left and right edges
            this.meshGeom.vertices[0].copy(this.head).add(normal);
            this.meshGeom.vertices[1].copy(this.head).sub(normal);

            this.meshGeom.verticesNeedUpdate = true;

        };

    };
    init();
};

    componentWillUnmount() {

    }

    render() {
        return(
			<div id="ribbons">
				&nbsp;
			</div>
        )
    }
}

export default Ribbons;