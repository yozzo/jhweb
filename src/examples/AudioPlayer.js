import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';
import shuffle from 'shuffle-array';

class AudioPlayer extends Component {
    state = {
        active: this.props.songs[0],
        current: 0,
        progress: 0,
        random: false,
        repeat: false,
        mute: false,
        play: this.props.autoplay || false,
        songs: this.props.songs
    }

    componentDidMount = () => {
        let playerElement = this.refs.player;
        playerElement.addEventListener('timeupdate', this.updateProgress);
        playerElement.addEventListener('ended', this.end);
        playerElement.addEventListener('error', this.next);
    }

    componentWillUnmount = () => {
        let playerElement = this.refs.player;
        playerElement.removeEventListener('timeupdate', this.updateProgress);
        playerElement.removeEventListener('ended', this.end);
        playerElement.removeEventListener('error', this.next);
    }

    setProgress = (e) => {
        let target = e.target.nodeName === 'SPAN' ? e.target.parentNode : e.target;
        let height = target.clientHeight;
        let rect = target.getBoundingClientRect();
        let offsetY = e.clientY - rect.top;
        let duration = this.refs.player.duration;
        let currentTime = (duration * offsetY) / height;
        let progress = (currentTime * 100) / duration;

        this.refs.player.currentTime = currentTime;
        this.setState({ progress: progress });
        this.play();
    }

    updateProgress = () => {
        let duration = this.refs.player.duration;
        let currentTime = this.refs.player.currentTime;
        let progress = (currentTime * 100) / duration;

        this.setState({ progress: progress });
    }

    play = () => {
        this.setState({ play: true });
        this.refs.player.play();
    }

    pause = () => {
        this.setState({ play: false });
        this.refs.player.pause();
    }

    toggle = () => {
        this.state.play ? this.pause() : this.play();
    }

    end = () => {
        (this.state.repeat) ? this.play() : this.setState({ play: false });
    }

    next = () => {
        var total = this.state.songs.length;
        var current = (this.state.repeat) ? this.state.current : (this.state.current < total - 1) ? this.state.current + 1 : 0;
        var active = this.state.songs[current];

        this.setState({ current: current, active: active, progress: 0 });

        this.refs.player.src = active.url;
        this.play();
    }

    previous = () => {
        var total = this.state.songs.length;
        var current = (this.state.current > 0) ? this.state.current - 1 : total - 1;
        var active = this.state.songs[current];

        this.setState({ current: current, active: active, progress: 0 });

        this.refs.player.src = active.url;
        this.play();
    }

    randomize = () => {
        var s = shuffle(this.state.songs.slice());

        this.setState({ songs: (!this.state.random) ? s : this.state.songs, random: !this.state.random });
    }

    repeat = () => {
        this.setState({ repeat: !this.state.repeat });
    }

    toggleMute = () => {
        let mute = this.state.mute;

        this.setState({ mute: !this.state.mute });
        this.refs.player.volume = (mute) ? 1 : 0;
    }

    render () {

        const { active, play, progress } = this.state;

        let coverClass = classnames('player-cover', {'no-height': !!!active.cover });
        let playPauseClass = classnames('fa', {'fa-pause': play}, {'fa-play': !play});
        let volumeClass = classnames('fa', {'fa-volume-up': !this.state.mute}, {'fa-volume-off': this.state.mute});
        let repeatClass = classnames('player-btn small repeat', {'active': this.state.repeat});
        let randomClass = classnames('player-btn small random', {'active': this.state.random });

        return (
            <div className="player-container">

                <span className="player-progress-container-wrapper" onClick={this.setProgress}>
                    <span className="player-progress-value" style={{height: progress + '%'}}></span>
                    <div className="player-progress-container"></div>
                </span>

                <audio src={active.url} autoPlay={this.state.play} preload="auto" ref="player"></audio>

                <div className="track-info">
                    <span className="track-tag">Playing Excerpt</span>
                    <h2 className="track-name">{active.track.name}</h2>
                    <a href={active.track.spotifyUrl} className="track-link" target="_blank">Full Listen</a>
                </div>

                <div className="player-options">
                    <div className="player-buttons player-controls">
                        <Link to={`/${active.slug}`} onClick={this.previous} className="player-btn medium" title="Previous Song">
                            <i className="fa fa-backward" />
                        </Link>

                        <button onClick={this.toggle} className="player-btn big" title="Play/Pause">
                            <i className={playPauseClass} />
                        </button>

                        <Link to={`/${active.slug}`} onClick={this.next} className="player-btn medium" title="Next Song">
                            <i className="fa fa-forward" />
                        </Link>
                    </div>

                    <div className="player-buttons">
                        <button className="player-btn small volume" onClick={this.toggleMute} title="Mute/Unmute">
                            <i className={volumeClass} />
                        </button>

                        <button className={repeatClass} onClick={this.repeat} title="Repeat">
                            <i className="fa fa-repeat" />
                        </button>

                        <button className={randomClass} onClick={this.randomize} title="Shuffle">
                            <i className="fa fa-random" />
                        </button>
                    </div>

                </div>
            </div>
        );
    }
}

AudioPlayer.propTypes = {
    autoplay: PropTypes.bool,
    songs: PropTypes.array.isRequired
};

export default AudioPlayer;
