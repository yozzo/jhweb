import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { hashHistory } from 'react-router';
import classnames from 'classnames';
import shuffle from 'shuffle-array';
import Rodal from 'rodal';

class AudioPlayer extends Component {

    state = {
        active: this.props.activeTrack,
        current: 0,
        next: 1,
        prev: this.props.songs.length - 1,
        progress: 0,
        random: false,
        repeat: false,
        mute: false,
        play: !this.props.isMobile || false,
        songs: this.props.songs,
        visible: false,
        isMobile: this.props.isMobile
    }

    componentDidMount = () => {
        let playerElement = this.refs.player,
            current = this.getCurrentTrackIndex();

        playerElement.addEventListener('timeupdate', this.updateProgress);
        playerElement.addEventListener('ended', this.triggerNext);
        playerElement.addEventListener('error', this.next);
        this.getCurrentTrackIndex();
        this.setNextTrackIndex(current);
        this.setPreviousTrackIndex(current);
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
        let player = this.refs.player;
        this.setState({ play: true });

        setTimeout(() => {
            player.play();
        }, 150);
    }

    getActiveTrack = () => {
        let activeTrack = this.props.activeTrack ? this.props.activeTrack.slug : this.state.songs[0].slug,
            songs = this.state.songs,
            item;

        songs.map((item, index) => {
            if (item.slug === activeTrack) {
                this.setState({ current: index, active: songs[index], progress: 0 });
            }
        });
    }

    getCurrentTrackIndex = () => {
        let songs = this.state.songs,
            trackIndex;

        songs.map((item, index) => {
            if (item.slug === this.state.active.slug) {
                this.setState({ current: index, active: songs[index], progress: 0 });
                trackIndex = index;
            }
        });

        return trackIndex;
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
        const total = this.state.songs.length;
        const current = (this.state.repeat) ? this.state.current : (this.state.current < total - 1) ? this.state.current + 1 : 0;
        const active = this.state.songs[current];
        this.setNextTrackIndex(current);
        this.setPreviousTrackIndex(current);
        this.setState({ current: current, active: active, progress: 0 });

        this.refs.player.src = active.url;
        this.play();
    }

    previous = () => {
        const total = this.state.songs.length;
        const current = (this.state.current > 0) ? this.state.current - 1 : total - 1;
        const active = this.state.songs[current];

        this.setNextTrackIndex(current);
        this.setPreviousTrackIndex(current);
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

    setNextTrackIndex = (current) => {
        const total = this.state.songs.length;
        let next;

        if (this.state.next >= total - 1 || current === total - 1) {
            next = 0
        }
        else if (this.state.next === 1 && current !== 0) {
            next = this.state.next + 1;
        }
        else {
            next = current + 1;
        }

        this.setState({next: next});

        return this;
    }

    setPreviousTrackIndex = (current) => {
        const total = this.state.songs.length;
        let prev;

        if (this.state.prev >= total - 1) {
            prev = total - 1;
        } else {
            prev = current -1;
        }

        this.setState({prev: prev});

        return this;
    }

    toggleMute = () => {
        let mute = this.state.mute;

        this.setState({ mute: !this.state.mute });
        this.refs.player.volume = (mute) ? 1 : 0;
    }

    triggerNext = () => {
        document.location.hash = this.nextButton.props.to;
        this.next();
    }

    showAbout() {
        this.setState({ visible: true });
    }

    createMarkup() {
        return {__html: $('.about').html()};
    }

    hide() {
        this.setState({ visible: false });
    }

    render () {

        const { active, play, progress, next, prev, songs, isMobile } = this.state;

        let playPauseClass = classnames('fa', {'fa-pause': play}, {'fa-play': !play});
        let volumeClass = classnames('fa', {'fa-volume-up': !this.state.mute}, {'fa-volume-off': this.state.mute});
        let repeatClass = classnames('player-btn small repeat', {'active': this.state.repeat});
        let randomClass = classnames('player-btn small random', {'active': this.state.random });
        return (
            <div>
                <h1 className="heading-name">JAMES<br/>
                    HEATHER</h1>

                <h2 className="heading-album">Stories<br/>
                    from<br/>
                    far<br/>
                    away<br/>
                    on<br/>
                    piano</h2>

                <div className="heading-link-container">
                    <a className="heading-link" onClick={this.showAbout.bind(this)}>About</a>
                    <a href="http://www.songkick.com/artists/9131569" target="_blank" className="heading-link songkick-widget">Tour</a>
                    <a href="https://jamesheather.lnk.to/stories/" target="_blank" className="heading-link">Shop</a>
                </div>

                <Rodal visible={this.state.visible} onClose={this.hide.bind(this)}>
                    <div className="rodal-content" dangerouslySetInnerHTML={this.createMarkup()}/>
                </Rodal>

                <div className="player-container">
                    {/*<span className="player-progress-container-wrapper" onClick={this.setProgress}>*/}
                    <span className="player-progress-container-wrapper">
                        <span className="player-progress-value" style={{height: progress + '%'}}></span>
                        <div className="player-progress-container"></div>
                    </span>

                    <audio src={active.url} autoPlay={!this.state.isMobile} preload="auto" ref="player"></audio>

                    <div className="track-info">
                        <span className="track-tag">Playing Excerpt</span>
                        <h2 className="track-name">{active.track.name}</h2>
                        <div className="track-link-wrapper">
                            <a href={active.track.spotifyUrl} className="track-link" target="_blank">Full Listen</a>
                        </div>
                    </div>

                    <div className="player-options">
                        <div className="player-buttons player-controls">
                            <Link to={`/${songs[prev].slug}`} onClick={this.previous} className="player-btn medium hide" title="Previous Song">
                                <i className="fa fa-backward" />
                            </Link>

                            <button onClick={this.toggle} className="player-btn big" title="Play/Pause">
                                <i className={playPauseClass} />
                            </button>

                            <Link to={`/${songs[next].slug}`} onClick={this.next} ref={button => this.nextButton = button}  className="player-btn medium" title="Next Song">
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
            </div>
        );
    }
}

AudioPlayer.propTypes = {
    autoplay: PropTypes.bool,
    songs: PropTypes.array.isRequired
};

export default AudioPlayer;
