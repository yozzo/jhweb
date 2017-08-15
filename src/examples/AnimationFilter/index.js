import React from 'react';

import baseVsFile from 'raw!./shaders/baseVs.vert';
import translateVsFile from 'raw!./shaders/translateVs.vert';
import baseFsFile from 'raw!./shaders/baseFs.frag';
import blurFile from 'raw!./shaders/blur.frag';
import contrastFragFile from 'raw!./shaders/contrast.frag';
import flowFragFile from 'raw!./shaders/flow.frag';
import reposFragFile from 'raw!./shaders/repos.frag';
import blackFragFile from 'raw!./shaders/black.frag';

import PIXI from '../../ref/pixi.js';
import dat from '../../ref/dat.gui.min.js';

class AnimationFilter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            boost: 0,
            audioUrl: props.audioUrl,
            playing: false,
            activeTrack: props.activeTrack
        };

    }

    componentDidMount() {
        this.playShaderAnimation();
        this.initFilter(this.state, this.props);
    }

    componentDidUpdate() {
        if (this.props.activeTrack.url !== this.state.activeTrack.url) {
            this.setActivetrack();
        }
    }

    setActivetrack() {
        let activeTrack = this.props.activeTrack;
        this.setState({activeTrack: activeTrack});
    }

    /**
     * Animation happens here
     * //TODO: ES6
     * @param audioUrl
     */
    initFilter(state, props) {
        var gl, cBB, canvas;
        var baseProgram, contrastProgram, blurProgram, flowProgram, reposProgram, blackProgram;
        var feedback, contrastFbo, blurFbo, flowFbo, reposFbo, lastFrameFbo, blackFbo;
        var baseVs, baseFs, translateVs, contrastFrag, blurFrag, reposFrag, flowFrag, blackFrag;
        var camTex, blackTex;
        var mouseX, mouseY;
        var mapMouseX = 1.01;
        var mapMouseY = 1.01;
        var videoLoaded = false;
        var interpMode = false;
        var video=document.createElement('video');
        var fish=document.createElement('img');
        let audioData,
            internalClock = 0,
            firstTimer = null,
            nextTimer = null,
            audioOutput = [10, 8];

        canvas = document.getElementById("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);
        window.addEventListener( 'resize', resizeCanvas );
        $('window').on("hashchange", debounce(onHashChange, 500), false);



        function initGl(){
            gl = getWebGLContext(canvas);
            gl.disable(gl.DEPTH_TEST);
            gl.enable(gl.BLEND);
            gl.viewport(0,0,canvas.width, canvas.height);

            if(!gl){
                alert("Looks like your browser / device doesn't support webgl");
                return;
            }
        }

        function initFbosAndShaders(){
            cBB = new pxBB();
            feedback = new pxFbo();
            contrastFbo = new pxFbo();
            blurFbo = new pxFbo();
            reposFbo = new pxFbo();
            flowFbo = new pxFbo();
            lastFrameFbo = new pxFbo();
            blackFbo = new pxFbo();

            feedback.allocate(canvas.width, canvas.height, interpMode);
            contrastFbo.allocate(canvas.width, canvas.height, interpMode);
            blurFbo.allocate(canvas.width, canvas.height, interpMode);
            reposFbo.allocate(canvas.width, canvas.height, interpMode);
            flowFbo.allocate(canvas.width, canvas.height, interpMode);
            lastFrameFbo.allocate(canvas.width, canvas.height, interpMode);
            blackFbo.allocate(canvas.width, canvas.height, interpMode);

            baseVs = createShaderFromFile(gl, baseVsFile, gl.VERTEX_SHADER);
            translateVs = createShaderFromFile(gl, translateVsFile, gl.VERTEX_SHADER);
            baseFs = createShaderFromFile(gl, baseFsFile, gl.FRAGMENT_SHADER);
            blurFrag = createShaderFromFile(gl, blurFile, gl.FRAGMENT_SHADER);
            contrastFrag = createShaderFromFile(gl, contrastFragFile, gl.FRAGMENT_SHADER);
            flowFrag = createShaderFromFile(gl, flowFragFile, gl.FRAGMENT_SHADER);
            reposFrag = createShaderFromFile(gl, reposFragFile, gl.FRAGMENT_SHADER);
            blackFrag = createShaderFromFile(gl, blackFragFile, gl.FRAGMENT_SHADER);

            baseProgram = createProgram(gl, [baseVs, baseFs]);
            contrastProgram = createProgram(gl, [baseVs, contrastFrag]);
            blurProgram = createProgram(gl, [baseVs, blurFrag]);
            reposProgram = createProgram(gl, [translateVs, reposFrag]);
            flowProgram = createProgram(gl, [baseVs, flowFrag]);
            blackProgram = createProgram(gl, [baseVs, blackFrag]);

            gl.useProgram(blurProgram);
            var step_w = gl.getUniformLocation(blurProgram,"step_w");
            gl.uniform1f(step_w, 1.75/canvas.width);
            var step_h = gl.getUniformLocation(blurProgram,"step_h");
            gl.uniform1f(step_h, 1.75/canvas.height);

            gl.useProgram(flowProgram);
            gl.uniform2f(gl.getUniformLocation(flowProgram,"scale"), 200.0,200.0);
            gl.uniform2f(gl.getUniformLocation(flowProgram,"offset"), 10/canvas.width, 10/canvas.height);
            gl.uniform1f(gl.getUniformLocation(flowProgram,"lambda"), 50.0);

            gl.useProgram(reposProgram);
            gl.uniform2f(gl.getUniformLocation(reposProgram, "amt"), 0.05,0.05);

            blackTex = createAndSetupTexture(gl);
        }

        function loop(){
            window.requestAnimationFrame(loop);

            if (videoLoaded){
                blackFbo.start();
                cBB.draw(blackProgram, blackTex);

                contrastFbo.start();
                cBB.draw(contrastProgram, camTex);

                flowFbo.start();
                contrastFbo.draw2(flowProgram, lastFrameFbo.texture);

                lastFrameFbo.start();
                contrastFbo.draw(baseProgram);

                blurFbo.start();
                flowFbo.draw(blurProgram);

                reposFbo.start();
                gl.useProgram(reposProgram);
                gl.uniform1f(gl.getUniformLocation(reposProgram,"u_mouseX"), mapMouseX);
                gl.uniform1f(gl.getUniformLocation(reposProgram,"u_mouseY"), mapMouseY);

                blackFbo.draw(baseProgram); //draw black
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.ONE_MINUS_DST_COLOR,gl.DST_COLOR); //blend it

                blurFbo.draw(baseProgram); //draw flow
                feedback.draw2(reposProgram, blurFbo.texture); //draw feedback
                gl.disable(gl.BLEND);

                feedback.start();
                reposFbo.draw(baseProgram);

                //draw to screen
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                feedback.draw(baseProgram);

                gl.bindTexture(gl.TEXTURE_2D, camTex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, camTex.image);
            }//end of videoLoaded
        }

        function getCamAsTexture(){
            camTex = createAndSetupTexture(gl);
            camTex.image = document.getElementById('absolute');
            gl.bindTexture(gl.TEXTURE_2D, camTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, camTex.image);
        }

        function getNewImg(){
            feedback.start();
            flowFbo.draw(baseProgram);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

        function map(value,max,minrange,maxrange) {
            return ((max-value)/(max))*(maxrange-minrange)+minrange;
        }

        function onDocumentMouseMove(event) {
            mouseX = (event.clientX );
            mouseY = (event.clientY );

            mapMouseX = map(10, window.innerWidth, 1.09,0.99);
            mapMouseY = map(10, window.innerHeight, 1.09,0.99);
        }

        function onDocumentMouseDown(event) {
            refreshView();
        }

        function httpGetAsync(theUrl, callback) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                    callback(xmlHttp.responseText);
            }
            xmlHttp.open("GET", theUrl, true); // true for asynchronous
            xmlHttp.send(null);
        }

        function debounce(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        };

        function onHashChange() {
            let audioDataUrl;

            if (window.location.hash === '#/ruqia') {
                audioDataUrl = 'data/JSON/01.json';
            } else if (window.location.hash === '#/empire_sounds') {
                audioDataUrl = 'data/JSON/02.json';
            } else if (window.location.hash === '#/last_minute_change_of_heart') {
                audioDataUrl = 'data/JSON/05.json';
            } else if (window.location.hash === '#/biomes') {
                audioDataUrl = 'data/JSON/04.json';
            } else if (window.location.hash === '#/mhope') {
                audioDataUrl = 'data/JSON/03.json';
            } else if (window.location.hash === '#/pathos') {
                audioDataUrl = 'data/JSON/06.json';
            } else if (window.location.hash === '#/teardrop_tattoo') {
                audioDataUrl = 'data/JSON/07.json';
            } else if (window.location.hash === '#/kraken') {
                audioDataUrl = 'data/JSON/08.json';
            } else if (window.location.hash === '#/blueprint') {
                audioDataUrl = 'data/JSON/09.json';
            }


            httpGetAsync('./' + audioDataUrl, function(response){
                audioData = JSON.parse(response);
            });

            internalClock = 0;
            let tick = 1;

            if (firstTimer === null) {
                clearInterval(nextTimer);

                firstTimer = setInterval(function () {
                    runAnalyser(internalClock);
                    internalClock = internalClock + 1;
                }, 46);

                nextTimer = null;
            } else if (nextTimer === null) {
                clearInterval(firstTimer);

                nextTimer = setInterval(function () {
                    runAnalyser(internalClock);
                    internalClock = internalClock + 1;
                }, 46);

                firstTimer = null;
            }
        }

        function refreshView() {
            getNewImg();
            interpMode = !interpMode;
            feedback.allocate(canvas.width, canvas.height, interpMode);
            contrastFbo.allocate(canvas.width, canvas.height, interpMode);
            blurFbo.allocate(canvas.width, canvas.height, interpMode);
            reposFbo.allocate(canvas.width, canvas.height, interpMode);
            flowFbo.allocate(canvas.width, canvas.height, interpMode);
            lastFrameFbo.allocate(canvas.width, canvas.height, interpMode);
            blackFbo.allocate(canvas.width, canvas.height, interpMode);
        }

        function handleVideo() {
            video.src =  './video/002.mp4';
            video.loop = true;
            video.play();
            videoLoaded = true;
            fish.src = './data/_displacement_fish1.png';
        }

        initGl();
        initFbosAndShaders();
        getCamAsTexture();
        resizeCanvas();
        loop();

        function runAnalyser(time) {
            if (audioData && audioData.matrix[time] !== undefined) {
                audioOutput = audioData.matrix[time].analyser;
                mapMouseX = map(audioOutput[0]*0.6, window.innerWidth, 1.09,0.99);
                mapMouseY = map(audioOutput[2]*0.6, window.innerHeight, 1.09,0.99);
            }
        }

        handleVideo();
        onHashChange();
    }

    //TODO(jf): move this in a separate module
    playShaderAnimation() {
        var renderer = PIXI.autoDetectRenderer(630, 410);
        renderer.view.style.position = "absolute";
        renderer.view.id = "absolute";
        renderer.view.style.top = 0;
        renderer.view.style.width = window.innerWidth + "px";
        renderer.view.style.height = window.innerHeight + "px";

        var filtersSwitchs = [true, false, false, false, false, false, false, false, false, false, false];

        document.getElementsByTagName('body')[0].appendChild(renderer.view);

        if ($('.dg').length) {
            $('.dg').remove();
        }

        let gui = new dat.GUI();
        dat.GUI.toggleHide();


        var displacementTexture = PIXI.Texture.fromImage("data/t4_biomes_map.jpg");
        var displacementFilter = new PIXI.DisplacementFilter(displacementTexture);

        var displacementFolder = gui.addFolder('Displacement');
        displacementFolder.add(filtersSwitchs, '0').name("apply");
        displacementFolder.add(displacementFilter.scale, 'x', 0, 200).name("scaleX");
        displacementFolder.add(displacementFilter.scale, 'y', 0, 200).name("scaleY");

        var blurFilter = new PIXI.BlurFilter();

        var blurFolder = gui.addFolder('Blur');
        blurFolder.add(filtersSwitchs, '1').name("apply").listen();
        blurFolder.add(blurFilter, 'blurX', 0, 32).name("blurX");
        blurFolder.add(blurFilter, 'blurY', 0, 32).name("blurY");

        ////

        var pixelateFilter = new PIXI.PixelateFilter();

        var pixelateFolder = gui.addFolder('Pixelate');
        pixelateFolder.add(filtersSwitchs, '2').name("apply");
        pixelateFolder.add(pixelateFilter.size, 'x', 1, 32).name("PixelSizeX");
        pixelateFolder.add(pixelateFilter.size, 'y', 1, 32).name("PixelSizeY");

        ////

        var invertFilter = new PIXI.InvertFilter();

        var invertFolder = gui.addFolder('Invert');
        invertFolder.add(filtersSwitchs, '3').name("apply");
        invertFolder.add(invertFilter, 'invert', 0, 1).name("Invert");

        ////

        var grayFilter = new PIXI.GrayFilter();

        var grayFolder = gui.addFolder('Gray');
        grayFolder.add(filtersSwitchs, '4').name("apply");
        grayFolder.add(grayFilter, 'gray', 0, 1).name("Gray");

        ////

        var sepiaFilter = new PIXI.SepiaFilter();

        var sepiaFolder = gui.addFolder('Sepia');
        sepiaFolder.add(filtersSwitchs, '5').name("apply");
        sepiaFolder.add(sepiaFilter, 'sepia', 0, 1).name("Sepia");

        ////

        var twistFilter = new PIXI.TwistFilter();

        var twistFolder = gui.addFolder('Twist');
        twistFolder.add(filtersSwitchs, '6').name("apply");
        twistFolder.add(twistFilter, 'angle', 0, 10).name("Angle");
        twistFolder.add(twistFilter, 'radius', 0, 1).name("Radius");

        twistFolder.add(twistFilter.offset, 'x', 0, 1).name("offset.x");;
        twistFolder.add(twistFilter.offset, 'y', 0, 1).name("offset.y");;

        ////

        var dotScreenFilter = new PIXI.DotScreenFilter();

        var dotScreenFolder = gui.addFolder('DotScreen');
        dotScreenFolder.add(filtersSwitchs, '7').name("apply");
        dotScreenFolder.add(dotScreenFilter, 'angle', 0, 10);
        dotScreenFolder.add(dotScreenFilter, 'scale', 0, 1);

        ////

        var colorStepFilter = new PIXI.ColorStepFilter();

        var colorStepFolder = gui.addFolder('ColorStep');
        colorStepFolder.add(filtersSwitchs, '8').name("apply");

        colorStepFolder.add(colorStepFilter, 'step', 1, 100);
        colorStepFolder.add(colorStepFilter, 'step', 1, 100);

        ////

        var crossHatchFilter = new PIXI.CrossHatchFilter();

        var crossHatchFolder = gui.addFolder('CrossHatch');
        crossHatchFolder.add(filtersSwitchs, '9').name("apply");


//	var filterCollection = [blurFilter, pixelateFilter, invertFilter, grayFilter, sepiaFilter, twistFilter, dotScreenFilter, //colorStepFilter, crossHatchFilter];

        var rgbSplitterFilter = new PIXI.RGBSplitFilter();

        var rgbSplitFolder = gui.addFolder('RGB Splitter');
        rgbSplitFolder.add(filtersSwitchs, '10').name("apply");


        var filterCollection = [displacementFilter, blurFilter, pixelateFilter, invertFilter, grayFilter, sepiaFilter, twistFilter, dotScreenFilter, colorStepFilter, crossHatchFilter, rgbSplitterFilter];


        // create an new instance of a pixi stage
        var stage = new PIXI.Stage(0xFF0000, true);



        var pondContainer = new PIXI.DisplayObjectContainer();
        stage.addChild(pondContainer);

        stage.interactive = true;

        var bg = PIXI.Sprite.fromImage("data/displacement_BG.jpg");
        pondContainer.addChild(bg);

        PIXI.Texture.fromImage("data/displacement_BG.jpg");
        PIXI.Texture.fromImage("data/displacement_BG1.jpg");
        PIXI.Texture.fromImage("data/displacement_BG2.jpg");
        PIXI.Texture.fromImage("data/displacement_BG3.jpg");
        PIXI.Texture.fromImage("data/displacement_BG4.jpg");
        PIXI.Texture.fromImage("data/displacement_BG5.jpg");
        PIXI.Texture.fromImage("data/displacement_BG6.jpg");
        PIXI.Texture.fromImage("data/displacement_BG7.jpg");
        PIXI.Texture.fromImage("data/displacement_BG8.jpg");
        PIXI.Texture.fromImage("data/displacement_BG9.jpg");

        //var fish = PIXI.Sprite.fromImage("displacement_fish2.jpg");//
        //littleDudes.position.y = 100;
        var padding = 100;
        var bounds = new PIXI.Rectangle(-padding, -padding, 630 + padding * 2, 410 + padding * 2)
        var fishs = [];

        function debounce(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        };

        window.addEventListener("hashchange", debounce(changeBackground, 500), false);

        function changeBackground() {
            if (window.location.hash === '#/empire_sounds') {
               bg.setTexture(PIXI.Texture.fromFrame('data/displacement_BG.jpg'));
            } else if (window.location.hash === '#/last_minute_change_of_heart') {
                bg.setTexture(PIXI.Texture.fromFrame('data/displacement_BG1.jpg'));
            } else if (window.location.hash === '#/biomes') {
                bg.setTexture(PIXI.Texture.fromFrame('data/displacement_BG2.jpg'));
            } else if (window.location.hash === '#/ruqia') {
                bg.setTexture(PIXI.Texture.fromFrame('data/displacement_BG3.jpg'));
            } else if (window.location.hash === '#/mhope') {
                bg.setTexture(PIXI.Texture.fromFrame('data/displacement_BG4.jpg'));
            } else if (window.location.hash === '#/pathos') {
                bg.setTexture(PIXI.Texture.fromFrame('data/displacement_BG6.jpg'));
            } else if (window.location.hash === '#/teardrop_tattoo') {
                bg.setTexture(PIXI.Texture.fromFrame('data/displacement_BG7.jpg'));
            } else if (window.location.hash === '#/kraken') {
                bg.setTexture(PIXI.Texture.fromFrame('data/displacement_BG8.jpg'));
            } else if (window.location.hash === '#/blueprint') {
                bg.setTexture(PIXI.Texture.fromFrame('data/displacement_BG9.jpg'));
            }
        }


        for (var i = 0; i < 20; i++)
        {
            var fishId = i % 4;
            fishId += 1;

            //console.log("displacement_fish"+fishId+".png")
            // var fish =  PIXI.Sprite.fromImage("data/displacement_fish"+fishId+".png");
            // fish.anchor.x = fish.anchor.y = 0.5;
            // pondContainer.addChild(fish);
            //
            // //var direction
            // //var speed =
            // fish.direction = Math.random() * Math.PI * 2;
            // fish.speed = 2 + Math.random() * 2;
            // fish.turnSpeed = Math.random() - 0.8;
            //
            // fish.position.x = Math.random() * bounds.width;
            // fish.position.y = Math.random() * bounds.height;
            // //fish.speed = new PIXI.Point(0,0)
            //
            // fish.scale.x = fish.scale.y = 0.8 + Math.random() * 0.3;
            // fishs.push(fish);

        };

        var overlay = new PIXI.TilingSprite(PIXI.Texture.fromImage("data/zeldaWaves.png"), 630, 410);
        overlay.alpha = 0.1//0.2
        pondContainer.addChild(overlay);


        displacementFilter.scale.x = 178;
        displacementFilter.scale.y = 200;
        dotScreenFilter.scale = 0;


        var count = 0;
        var switchy = false;

        requestAnimFrame(animate);

        function animate() {

            count += 0.1;

            var blurAmount = Math.cos(count) ;
            var blurAmount2 = Math.sin(count * 0.8)  ;

            var filtersToApply = [];

            for (var i = 0; i < filterCollection.length; i++) {

                if(filtersSwitchs[i])filtersToApply.push(filterCollection[i]);
            };

            pondContainer.filters = filtersToApply.length > 0 ? filtersToApply : null;

            for (var i = 0; i < fishs.length; i++)
            {
                var fish = fishs[i];

                fish.direction += fish.turnSpeed * 0.01;
                fish.position.x += Math.sin(fish.direction) * fish.speed;
                fish.position.y += Math.cos(fish.direction) * fish.speed;

                fish.rotation = -fish.direction - Math.PI/2;

                // wrap..

                if(fish.position.x < bounds.x)fish.position.x += bounds.width;
                if(fish.position.x > bounds.x + bounds.width)fish.position.x -= bounds.width

                if(fish.position.y < bounds.y)fish.position.y += bounds.height;
                if(fish.position.y > bounds.y + bounds.height)fish.position.y -= bounds.height
            }


            displacementFilter.offset.x = count * 10//blurAmount * 40;
            displacementFilter.offset.y = count * 10

            overlay.tilePosition.x = count * -10//blurAmount * 40;
            overlay.tilePosition.y = count * -10

            renderer.render(stage);
            requestAnimFrame( animate );
            changeBackground();
        }
    }

    render() {
        // const ExampleComponent = this.props.children.props.videoInput;

        return(
            <div id="container">
                <canvas id="canvas" style={{background:'black', position:'absolute', top:0, left:0, width:'100%', height:'100%'}}>
                    Sorry but you're browser doesn't support the canvas :(
                </canvas>
            </div>
        )
    }
}

export default AnimationFilter;