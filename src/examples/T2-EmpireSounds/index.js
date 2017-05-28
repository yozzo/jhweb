import React from 'react';
// import React3 from 'react-three-renderer';
// import * as THREE from 'three';
import Ribbons from './libs/main.js';

class EmpireSounds extends React.Component {
    static propTypes = {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
    };

    constructor(props, context) {
        super(props, context);
    }

    componentWillUnmount() {
        // this.audio.stopAudio();
    }

    render() {
        return (
            <Ribbons audioData={this.props.audioData}/>
        );
    }
}

export default EmpireSounds;
