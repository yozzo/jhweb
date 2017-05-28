import React from 'react';
import AudioAnalyzer from 'AudioVisualizer/audio';

class VisualizerContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            audioBoost: '',
            audioUrl: this.props.audioUrl,
            videoInput: this.props.videoInput,
            isPlaying: false
        };

        this.audioBoost = this.getAudioBoost.bind(this);

        this.handleFilterTextInput = this.handleFilterTextInput.bind(this);
        this.handleInStockInput = this.handleInStockInput.bind(this);
    }

    getAudioBoost(boost) {
        this.setState({
            audioBoost: boost
        });
    }

    render() {
        return (
            <div>
                <AudioAnalyzer audioUrl={this.state.audioUrl}/>
                <Screen
                    audioInput={this.state.audioBoost}
                    videoInput={this.state.videoInput}
                />
            </div>
        );
    }
}