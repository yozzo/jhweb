import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import TrackBrowser from './examples/TrackBrowser';
import Homepage from './examples/homepage';
import Perf from 'react-addons-perf';

window.Perf = Perf;

ReactDOM.render(
<div>
    <Router history={hashHistory}>
    <Route exact={true} path="/" component={Homepage} history={hashHistory}/>
    <Route path="/(:slug)" component={TrackBrowser} />
    </Router>
</div>,
    document.getElementById('content')
);


