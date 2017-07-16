import React from 'react';
import './lib.js';

class AnimationFilter extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            boost: 0,
            audioUrl: props.audioUrl,
            playing: false
        };

        // let lib = new AnimationLib;
        // lib.init();
    }

    componentDidMount() {
        // debugger;
        this.initFilter();
    }

    componentDidUpdate() {

    }

    /**
     * Animation happens here
     * //TODO: ES6
     * @param audioUrl
     */
    initFilter() {

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

        canvas = document.getElementById("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);
        window.addEventListener( 'resize', resizeCanvas );

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

            baseVs = createShaderFromScriptElement(gl, "baseVs");
            translateVs = createShaderFromScriptElement(gl, "translateVs");

            baseFs = createShaderFromScriptElement(gl, "baseFs");
            contrastFrag = createShaderFromScriptElement(gl, "contrastFrag");
            blurFrag = createShaderFromScriptElement(gl, "blurFrag");
            reposFrag = createShaderFromScriptElement(gl, "reposFrag");
            flowFrag = createShaderFromScriptElement(gl, "flowFrag");
            blackFrag = createShaderFromScriptElement(gl, "blackFrag");

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
            camTex.image = video;

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

            mapMouseX = map(mouseX, window.innerWidth, 1.09,0.99);
            mapMouseY = map(mouseY, window.innerHeight, 1.09,0.99);
        }

        function onDocumentMouseDown(event) {
            refreshView();
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
            video.src =  './video/trim_2.mp4';

            console.log(video.src);
            video.loop = true;
            video.play();
            videoLoaded = true;
        }

        initGl();
        initFbosAndShaders();
        getCamAsTexture();
        resizeCanvas();
        loop();

        // debugger;


        setInterval(function() {
            var audioInput = $('#audioValue').attr('data');
            var randomnumber = Math.floor(Math.random()*11)*10;

            console.log(audioInput);

            if (audioInput > 7 && audioInput < 8) {
                mapMouseX = map(10 * audioInput, window.innerWidth, 1.09,0.99);
                mapMouseY = map(50 * audioInput, window.innerHeight, 1.09,0.99);
            } else if (audioInput > 9 && audioInput < 10) {
                console.log('oink');
                mapMouseX = map(randomnumber * audioInput, window.innerWidth, 1.09,0.99);
                mapMouseY = map(randomnumber * audioInput, window.innerHeight, 1.09,0.99);
            } else if (audioInput > 13  && audioInput < 14) {
                refreshView();
            }

        }, 100);

        // window.addEventListener('DOMContentLoaded', function(){
            handleVideo();
        // });
    }

    render() {
        // const ExampleComponent = this.props.children.props.videoInput;

        return(
            <div id="container">
                <canvas id="canvas">
                    Sorry but you're browser doesn't support the canvas :(
                </canvas>
            </div>
        )
    }
}

export default AnimationFilter;