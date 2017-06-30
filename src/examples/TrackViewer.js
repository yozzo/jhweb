import React from 'react';
import sizeMe from 'react-sizeme';
import AudioAnalyser from './AudioVisualizer/audio'

const ExampleViewer = ({ example, size }) => {
  let sourceButton = null;
  let exampleContent = null;
  let media = '';

  if (example) {

    if (example.media) {
        media = example.media
    }

    const {
      component: ExampleComponent,
      url,
    } = example;

    exampleContent = (
      <div>
        <AudioAnalyser audioUrl={media}>
          <ExampleComponent
              width={size.width}
              height={size.height}
              videoInput={ExampleComponent}
          />
        </AudioAnalyser>
      </div>
    );
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
