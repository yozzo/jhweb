import React from 'react';
import sizeMe from 'react-sizeme';

const ExampleViewer = ({ example, size }) => {
  let sourceButton = null;
  let exampleContent = null;

  if (example) {
    const {
      component: ExampleComponent,
      url,
    } = example;
    exampleContent = (<ExampleComponent width={size.width} height={size.height} />);
    sourceButton = (<div key="src" id="button">
      <a
        href={`https://open.spotify.com/album/3ILBGXvUwP6kVni9wAFuCU`}
        target="_blank"
      >
        Listen on Spotify
      </a>
    </div>);
  }

  return (
    <div id="viewer">
      {exampleContent}
      {sourceButton}
    </div>
  );
};

ExampleViewer.propTypes = {
  example: React.PropTypes.object,
  size: React.PropTypes.object,
};

export default sizeMe({ monitorHeight: true, refreshRate: 200 })(ExampleViewer);
