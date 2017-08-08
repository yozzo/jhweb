import React from 'react';
import { Link } from 'react-router';
import AudioPlayer from './AudioPlayer';
import TrackViewer from './TrackViewer';
import {hashHistory}  from 'react-router';

import SimpleExample from './Simple/index';
import ManualRenderingExample from './ManualRendering/index';
import ClothExample from './AnimationCloth/index';
import GeometriesExample from './Geometries/index';
import CameraExample from './WebGLCameraExample/index';
import GeometryShapesExample from './GeometryShapes/index';
import DraggableCubes from './DraggableCubes/index';
import Physics from './Physics/index';
import PhysicsMousePick from './Physics/mousePick';
import BenchmarkRotatingCubes from './Benchmark/RotatingCubes';
import RotatingCubesDirectUpdates from './Benchmark/RotatingCubesDirectUpdates';
import AnimationFilter from './AnimationFilter/index';


import EmpireSounds from './T2-EmpireSounds/index';
import Biomes from './T4-Biomes/index';
import Ruqia from './T1-Ruqia/index';
// import MHope from './T1-Ruqia/index';


const songs = [
    {
        url: 'data/04 Biomes(Shorter_Immersive_Website_Version).mp3',
        cover: 'path/to/jpeg',
        component: Ruqia,
        slug: 'biomes',

        track: {
            name: 'Biomes',
            audioData: 'data/JSON/04.json',
            spotifyUrl: 'https://open.spotify.com/track/4bOF8DXNCvK5thdzzpQnMy'
        }
    },
    {
        url: 'data/02 Empire Sounds(Shorter_Immersive_Website_Version).mp3',
        component: Ruqia,
        slug: 'empire_sounds',

        track: {
            name: 'Empire Sounds',
            audioData: 'data/JSON/02.json',
            spotifyUrl: 'https://open.spotify.com/track/4bOF8DXNCvK5thdzzpQnMy'
        }
    },
    {
        url: 'data/05 Lastminutechangeofheart_(Shorter_Immersive_Website_Version).mp3',
        component: Ruqia,
        slug: 'last_minute_change_of_heart',

        track: {
            name: 'Last Minute Change Of Heart',
            audioData: 'data/JSON/05.json',
            spotifyUrl: 'https://open.spotify.com/track/4bOF8DXNCvK5thdzzpQnMy'
        }
    }
    // {
    //     url: 'data/03 MHope(Shorter_Immersive_Website_Version).mp3',
    //     component: Ruqia,
    //     slug: 'mhope',
    //
    //     track: {
    //         name: '03/ MHope',
    //         audioData: 'data/JSON/03.json',
    //         spotifyUrl: 'https://open.spotify.com/album/3ILBGXvUwP6kVni9wAFuCU'
    //     }
    // },

];

const TrackBrowser = ({ params }) => {
    // let initialSlug = songs[0].slug,
    //     slug,
    //     activeExample,
    //     index = 1;
    //
    // if (typeof params.slug === undefined) {
    //     slug = initialSlug;
    // }
    //
    // if (params.slug === initialSlug) {
    //     slug = songs[index].slug;
    //     initialSlug = slug;
    //     index++;
    // }
    //
    // slug = params.slug ? params.slug : songs[0].slug;
    let activeExample = params.slug && songs.find(songs => songs.slug === params.slug);

    return (
        <div>
            {/*<TrackViewer example={activeExample} />*/}
            <AudioPlayer songs={songs} activeTrack={activeExample}/>
            <AnimationFilter activeTrack={activeExample}/>
        </div>
    );
};

TrackBrowser.propTypes = {
    params: React.PropTypes.object.isRequired
};

export default TrackBrowser;





