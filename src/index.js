import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import AlbumBrowser from './examples/AlbumBrowser';
import Perf from 'react-addons-perf';

window.Perf = Perf;

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/(:slug)" component={AlbumBrowser} />
  </Router>,
  document.getElementById('content')
);
