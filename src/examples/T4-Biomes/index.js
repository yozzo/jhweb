import React from 'react';
import React3 from 'react-three-renderer';
import * as THREE from 'three';
import AudioAnalyzer from '../AudioVisualizer/audio';

import './libs/jquery-2.0.0.min.js';
class Biomes extends React.Component {
    static propTypes = {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired
    };


    constructor(props, context) {
        super(props, context);

        const audioData = {url: 'data/04 Biomes(Shorter_Immersive_Website_Version).mp3'};
        
        this.audio = new AudioAnalyzer(audioData);
        
        this.audio.playAudio();

        this.cameraPosition = new THREE.Vector3(0, 0, 5);

        this.audioLevels = 0;
        
        

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

            var boost = 0;

            setInterval(
                getBoost,
                10
            );

            function getBoost() {

                this.audioLevels =  $('#audioValue').val()

                // boost = $('#audioValue').val();
            }
        };


    }

    componentWillUnmount() {
        this.audio.stopAudio();
    }

    render() {
        const {
            width,
            height,
        } = this.props;

        // or you can use:
        // width = window.innerWidth
        // height = window.innerHeight

        return (
<div>
            <React3
            mainCamera="camera" // this points to the perspectiveCamera below
            width={width}
            height={height}
        
            onAnimate={this._onAnimate}
        >


                <scene>

                <perspectiveCamera
                    name="camera"
                    fov={75}
                    aspect={width / height}
                    near={0.1}
                    far={1000}
        
                    position={this.cameraPosition}
                />
                <mesh
                    rotation={this.state.cubeRotation}
                >
                    <boxGeometry
                        width={1}
                        height={1}
                        depth={1}
                    />
                    <meshBasicMaterial
                        color={0x00ff00}
                    />
                </mesh>
            </scene>

            </React3>
                <AudioAnalyzer audioUrl={'data/04 Biomes.mp3'}/>
                </div>
        );
    }
}

export default Biomes;
