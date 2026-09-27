import React from 'react';
import { Composition } from 'remotion';
import { TutorialVideo, TutorialVideoProps } from './TutorialVideo';
import { TutorialPart2, TutorialPart2Props } from './TutorialPart2';

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
          hasAudio: true,
        }}
      />
      <Composition<TutorialPart2Props>
        id="TutorialPart2"
        component={TutorialPart2}
        durationInFrames={870} // 29 seconds at 30 fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          hasAudio: true,
        }}
      />
    </>
  );
};

