import React from 'react';
import {hashHistory} from 'react-router';

class Homepage extends React.Component {
    componentDidMount = () => {
        hashHistory.push('/ruqia');
    };

    render = () => {
        return(
            <div>&nbsp;</div>
        )
    }
}

export default Homepage;
