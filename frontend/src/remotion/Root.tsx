import React from 'react';
import { Composition } from 'remotion';
import { TutorialVideo, TutorialVideoProps } from './TutorialVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition<TutorialVideoProps>
        id="TutorialVideo"
        component={TutorialVideo}
        durationInFrames={900} // 30 seconds at 30 fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          hasAudio: false,
        }}
      />
    </>
  );
};
