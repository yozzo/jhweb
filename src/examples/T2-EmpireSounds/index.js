import React from 'react';
// import React3 from 'react-three-renderer';
import * as THREE from 'three';


import Ribbons from './libs/main.js';

import AudioAnalyzer from '../AudioVisualizer/audio';

class EmpireSounds extends React.Component {
    static propTypes = {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired
    };

    constructor(props, context) {
        super(props, context);

        this.state = {
            audioUrl: 'data/02 Empire Sounds(Shorter_Immersive_Website_Version).mp3'
        };

        const audioData = {url: 'data/02 Empire Sounds(Shorter_Immersive_Website_Version).mp3'};

        // this.audio = new AudioAnalyzer(audioData);

        // console.log('this.audio.state.boost', this.audio.getBoost() );
        this.ribbons = new Ribbons();

        // this.state.audioLevels = setInterval(
        //     this.audio.getBoost, 100
        // );

        // this.audio.playAudio(audioData.url);
        this.ribbons.init();

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
                ),
            });
        };
    }

    componentWillUnmount() {
        // this.audio.stopAudio();
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
                <AudioAnalyzer audioUrl={'data/02 Sounds Of The Empire.mp3'}/>
                <div id="empire-sounds">foo</div>
            </div>
        );
    }
}

export default EmpireSounds;
