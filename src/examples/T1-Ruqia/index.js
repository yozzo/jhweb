import React from 'react';
import * as THREE from 'three';
import PIXI from '../../ref/pixi.js';
import dat from '../../ref/dat.gui.min.js';


class Ruqia extends React.Component {
    static propTypes = {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired
    };

    constructor(props, context) {
        super(props, context);

        console.log(PIXI);

        this.cameraPosition = new THREE.Vector3(0, 0, 5);

        // construct the position vector here, because if we use 'new' within render,
        // React will think that things have changed when they have not.

        this.state = {
            cubeRotation: new THREE.Euler()
        };



        this._onAnimate = () => {
            // we will get this callback every frame

            // pretend cubeRotation is immutable.
            // this helps with updates and pure rendering.
            // React will be sure that the rotation has now updated.
            this.setState({
                cubeRotation: new THREE.Euler(
                    this.state.cubeRotation.x + 0.1,
                    this.state.cubeRotation.y + 0.1,
                    0
                )
            });
        };

        this.playShaderAnimation();
    }

    componentDidMount = () => {

    }

    playShaderAnimation() {
        var renderer = PIXI.autoDetectRenderer(630, 410);
        renderer.view.style.position = "absolute";
        renderer.view.style.width = window.innerWidth + "px";
        renderer.view.style.height = window.innerHeight + "px";
        renderer.view.style.display = "block";

        var filtersSwitchs = [true, false, false, false, false, false, false, false, false, false, false];

        // add render view to DOM
        setTimeout(function(){
            document.getElementsByTagName('body')[0].appendChild(renderer.view);
        }, 300);

        if ($('.dg').length) {
            $('.dg').remove();
        }

        var gui = new dat.GUI({
            //height : 5 * 32 - 1,

            //width : 350
        });


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
        ////

        var displacementTexture = PIXI.Texture.fromImage("data/t4_biomes_map.jpg");
        var displacementFilter = new PIXI.DisplacementFilter(displacementTexture);

        var displacementFolder = gui.addFolder('Displacement');
        displacementFolder.add(filtersSwitchs, '0').name("apply");
        displacementFolder.add(displacementFilter.scale, 'x', 200, 200).name("scaleX");
        displacementFolder.add(displacementFilter.scale, 'y', 200, 200).name("scaleY");

        var blurFilter = new PIXI.BlurFilter();

        var blurFolder = gui.addFolder('Blur');
        blurFolder.add(filtersSwitchs, '1').name("apply");
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

        //var fish = PIXI.Sprite.fromImage("displacement_fish2.jpg");//
        //littleDudes.position.y = 100;
        var padding = 100;
        var bounds = new PIXI.Rectangle(-padding, -padding, 630 + padding * 2, 410 + padding * 2)
        var fishs = [];


        for (var i = 0; i < 20; i++)
        {
            var fishId = i % 4;
            fishId += 1;

            //console.log("displacement_fish"+fishId+".png")
            var fish =  PIXI.Sprite.fromImage("data/displacement_fish"+fishId+".png");
            fish.anchor.x = fish.anchor.y = 0.5;
            pondContainer.addChild(fish);

            //var direction
            //var speed =
            fish.direction = Math.random() * Math.PI * 2;
            fish.speed = 2 + Math.random() * 2;
            fish.turnSpeed = Math.random() - 0.8;

            fish.position.x = Math.random() * bounds.width;
            fish.position.y = Math.random() * bounds.height;
            //fish.speed = new PIXI.Point(0,0)

            fish.scale.x = fish.scale.y = 0.8 + Math.random() * 0.3;
            fishs.push(fish);

        };

        var overlay = new PIXI.TilingSprite(PIXI.Texture.fromImage("data/zeldaWaves.png"), 630, 410);
        overlay.alpha = 0.1//0.2
        pondContainer.addChild(overlay);




        //pondContainer.filters = [displacementFilter];



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
        }
    }

    render() {
        const {
            width,
            height,
            audioData
        } = this.props;

        // or you can use:
        // width = window.innerWidth
        // height = window.innerHeight

        return(
            <div style={{display: 'block', margin: '50vh auto', width:'100%', ['text-align']:'center' }}>Encoding audio signal to data...</div>
        );
    }
}

export default Ruqia;
