import React from 'react';
import { Composition } from 'remotion';
import { TutorialVideo, TutorialVideoProps } from './TutorialVideo';
import { TutorialPart2, TutorialPart2Props } from './TutorialPart2';
import { TutorialPart3, TutorialPart3Props } from './TutorialPart3';

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
      <Composition<TutorialPart3Props>
        id="TutorialPart3"
        component={TutorialPart3}
        durationInFrames={3660} // 122 seconds at 30 fps (Gemini problem->solution intro + 7 workflow clips + Gemini outro)
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
