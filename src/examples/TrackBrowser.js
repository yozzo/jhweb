import React from 'react';
import { Link } from 'react-router';
import AudioPlayer from './AudioPlayer';
import TrackViewer from './TrackViewer';

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

import EmpireSounds from './T2-EmpireSounds/index';
import Biomes from './T4-Biomes/index';
import Ruqia from './T1-Ruqia/index';



const examples = [
  // {
  //   name: 'Simple',
  //   component: SimpleExample,
  //   url: 'Simple/index',
  //   slug: 'webgl_simple'
  // },
  // {
  //   name: 'Cloth',
  //   component: ClothExample,
  //   url: 'AnimationCloth/index',
  //   slug: 'webgl_cloth'
  // },
  // {
  //   name: 'Camera',
  //   component: CameraExample,
  //   url: 'WebGLCameraExample/index',
  //   slug: 'webgl_camera'
  // },
  // {
  //   name: 'Geometries',
  //   component: GeometriesExample,
  //   url: 'Geometries/index',
  //   slug: 'webgl_geometries'
  // },
  // {
  //   name: 'Geometry Shapes',
  //   component: GeometryShapesExample,
  //   url: 'GeometryShapes/index',
  //   slug: 'webgl_geometry_shapes'
  // },
  // {
  //   name: 'Draggable Cubes',
  //   component: DraggableCubes,
  //   url: 'DraggableCubes/index',
  //   slug: 'webgl_draggable_cubes'
  // },
  // {
  //   name: 'Physics',
  //   component: Physics,
  //   url: 'Physics/index',
  //   slug: 'webgl_physics'
  // },
  // {
  //   name: 'Physics - MousePick',
  //   component: PhysicsMousePick,
  //   url: 'Physics/mousePick',
  //   slug: 'webgl_physics_mousepick'
  // },
  // {
  //   separator: true,
  //   name: 'Advanced'
  // },
  // {
  //   name: 'Without react-dom',
  //   advanced: true,
  //   page: 'advanced.html'
  // },
  // {
  //   name: 'Manual rendering',
  //   component: ManualRenderingExample,
  //   url: 'ManualRendering/index',
  //   slug: 'advanced_manual_rendering'
  // },
  // {
  //   separator: true,
  //   name: 'Benchmarks',
  // },
  // {
  //   name: 'RotatingCubes - Through React',
  //   component: BenchmarkRotatingCubes,
  //   url: 'Benchmark/RotatingCubes',
  //   slug: 'benchmarks_rotating_cubes_react'
  // },
  // {
  //   name: 'RotatingCubes - Direct Updates',
  //   component: RotatingCubesDirectUpdates,
  //   url: 'Benchmark/RotatingCubesDirectUpdates',
  //   slug: 'benchmarks_rotating_cubes_direct'
  // },
    {
        name: 'Ruqia',
        component: Ruqia,
        url: 'Ruqia',
        slug: 'ruqia',
        media: 'data/01 Ruqia(Shorter_Immersive_Website_Version).mp3',
        spotifyUrl: 'https://open.spotify.com/album/3ILBGXvUwP6kVni9wAFuCU'
    },
  {
    name: 'Empire Sounds',
    component: EmpireSounds,
    url: 'EmpireSounds',
    slug: 'empire_sounds',
    media: 'data/02 Empire Sounds(Shorter_Immersive_Website_Version).mp3',
    spotifyUrl: 'https://open.spotify.com/album/3ILBGXvUwP6kVni9wAFuCU'
  },
  {
    name: 'Biomes',
    component: Biomes,
    url: 'biomes',
    slug: 'biomes',
    media: 'data/04 Biomes(Shorter_Immersive_Website_Version).mp3',
    spotifyUrl: 'https://open.spotify.com/album/3ILBGXvUwP6kVni9wAFuCU'
  }
];

const songs = [
    {
        url: 'data/01 Ruqia(Shorter_Immersive_Website_Version).mp3',
        component: Ruqia,
        slug: 'ruqia',

        track: {
            name: '01/ Ruqia',
            spotifyUrl: 'https://open.spotify.com/album/3ILBGXvUwP6kVni9wAFuCU'
        }
    },
    {
        url: 'data/02 Empire Sounds(Shorter_Immersive_Website_Version).mp3',
        component: EmpireSounds,
        slug: 'empire_sounds',

        track: {
            name: '02/ Empire Sounds',
            spotifyUrl: 'https://open.spotify.com/album/3ILBGXvUwP6kVni9wAFuCU'
        }
    },
    {
        url: 'data/04 Biomes(Shorter_Immersive_Website_Version).mp3',
        cover: 'path/to/jpeg',
        component: Biomes,
        slug: 'biomes',

        track: {
            name: '04/ Biomes',
            spotifyUrl: 'https://open.spotify.com/album/3ILBGXvUwP6kVni9wAFuCU'
        }
    }
];

const TrackBrowser = ({ params }) => {
  const activeExample = params.slug && examples.find(example => example.slug === params.slug);
  return (
    <div>
      <AudioPlayer songs={songs}/>
      <TrackViewer example={activeExample} />
    </div>
  );
};

TrackBrowser.propTypes = {
  params: React.PropTypes.object.isRequired
};

export default TrackBrowser;
