import React from 'react';

let context,
    source,
    sourceJs,
    analyser,
    boost = 0,
    matrix = [];

class AudioAnalyzer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            boost: 0,
            audioUrl: props.audioUrl,
            playing: false
        };
    }

    componentDidMount() {

        this.playAudio(this.props.audioUrl);
        this.timerID = setInterval(
            () => this.getBoost(),
            10
        );

        this.setState({
            isPlaying: true,
            audioUrl: this.props.audioUrl
        })
    }

    componentDidUpdate() {
        if (this.state.isPlaying && this.state.audioUrl !== this.props.audioUrl) {
            this.stopAudio();
            clearInterval(this.timerID);

            this.setState({
                isPlaying: false,
                audioUrl: this.props.audioUrl
            });

            this.playAudio(this.props.audioUrl);
            this.timerID = setInterval(
                () => this.getBoost(),
                10
            );

            this.setState({
                isPlaying: true
            });
        }
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
                        analyser.fftSize = 32;

                        source = context.createBufferSource();
                        source.buffer = buffer;
                        source.loop = false;
                        source.connect(analyser);
                        analyser.connect(sourceJs);
                        source.connect(context.destination);
                        source.start(0); //play

                        var a = performance.now();
                        let index = 0;
                            let audioObject = {
                                'audioUrl': audioUrl
                            };

                        let audioData = [];

                        sourceJs.onaudioprocess = function (e) {
                            array = new Uint8Array(analyser.frequencyBinCount);
                            analyser.getByteFrequencyData(array);
                            boost = 0;




                            for (var i = 0; i < array.length; i++) {

                                boost += array[i];
                                // console.log('>>> i >>>> ', boost, i, array[i]);
                            }
                            // boost = boost / array.length;

                            var b = performance.now();


                            audioData = {
                                analyser: [array[0], array[1], array[2], array[3], array[4]],
                                index: index,
                                timeStamp: b - a
                            };



                            // console.log(audioObject);


                        };

                        setInterval(function(){
                            matrix.push(audioData);
                            audioObject.matrix = matrix;

                            // console.log('ce?');


                            index++;
                        }, 46);


                        setTimeout(function() {
                            source.disconnect(analyser);
                            analyser.disconnect(sourceJs);
                            source.disconnect(context.destination);

                            console.log(audioObject);
                            window.localStorage.setItem(audioUrl,  JSON.stringify(audioObject));
                        }, 122400); //set track time in milliseconds



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
    }

    getBoost() {
        this.setState({
            boost: boost
        });
    }

    stopAudio() {
        if (typeof source !== 'undefined') {
            source.disconnect(analyser);
            analyser.disconnect(sourceJs);
            source.disconnect(context.destination);
        }
    }
    
    componentWillUnmount() {
        this.stopAudio();
        clearInterval(this.timerID);
    }

    render() {
        const ExampleComponent = this.props.children.props.videoInput;
        return(
            <div id="audioValue" data={this.state.boost}>
                <ExampleComponent
                    width={this.props.children.props.width}
                    height={this.props.children.props.height}
                    audioData={this.state.boost}
                />
            </div>
        )
    }
}

export default AudioAnalyzer;