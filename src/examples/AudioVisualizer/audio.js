import React from 'react';

let context,
    source,
    sourceJs,
    analyser,
    boost = 0;

class AudioAnalyzer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            boost: 0,
            audioUrl: props.audioUrl
        };
    }

    componentDidMount() {
        this.playAudio(this.state.audioUrl);
        this.timerID = setInterval(
            () => this.getBoost(),
            10
        );
    }

    /**
     * Audio analysis happens here
     * //TODO: ES6
     * @param audioUrl
     */
    playAudio(audioUrl) {
        let url = audioUrl && audioUrl;
        let array = new Array();
        // let boost = 0;
        // let state = this.state.playerState;
        let request;

        try {
            if (typeof webkitAudioContext === 'function' || 'webkitAudioContext' in window) {
                if (typeof context !== 'undefined') {
                    context = new webkitAudioContext();
                }
            } else {
                context = new AudioContext();
            }
        }
        catch (e) {
            console.log('Web Audio API is not supported in this browser ', e);
        }

        request = new XMLHttpRequest();

        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        request.onload = function () {
            if (context && context.decodeAudioData) {
                context.decodeAudioData(
                    request.response,
                    function (buffer) {
                        if (!buffer) {
                            console.log('Error decoding file data');
                            return;
                        }

                        sourceJs = context.createScriptProcessor(2048, 1, 1);
                        sourceJs.buffer = buffer;
                        sourceJs.connect(context.destination);
                        analyser = context.createAnalyser();
                        analyser.smoothingTimeConstant = 0.6;
                        analyser.fftSize = 512;

                        source = context.createBufferSource();
                        source.buffer = buffer;
                        source.loop = true;
                        source.connect(analyser);
                        analyser.connect(sourceJs);
                        source.connect(context.destination);
                        source.start(0); //play
                        
                        sourceJs.onaudioprocess = function (e) {
                            array = new Uint8Array(analyser.frequencyBinCount);
                            analyser.getByteFrequencyData(array);
                            boost = 0;

                            for (var i = 0; i < array.length; i++) {
                                boost += array[i];
                            }
                            boost = boost / array.length;


                        };

                    },
                    function (error) {
                        console.log('Decoding error:' + error);
                    }
                );

            }
        };

        request.onerror = function () {
            console.log('buffer: XHR error');
        };

        request.send();
        // this.state.boost = boost;
    }

    getBoost() {
        this.setState({
            boost: boost
        });
        // return boost;
    }

    stopAudio() {
        source.disconnect(analyser);
        analyser.disconnect(sourceJs);
        source.disconnect(context.destination);
    }
    
    componentWillUnmount() {
        this.stopAudio();
        clearInterval(this.timerID);
    }

    render() {
        return(
            <input id="audioValue" type="hidden" value={this.state.boost}/>
        )
    }
}

export default AudioAnalyzer;