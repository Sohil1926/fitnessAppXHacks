// 1. Install dependencies DONE
// 2. Import dependencies DONE
// 3. Setup webcam and canvas DONE
// 4. Define references to those DONE
// 5. Load posenet DONE
// 6. Detect function DONE
// 7. Drawing utilities from tensorflow DONE
// 8. Draw functions DONE

import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';
import Webcam from 'react-webcam';
import { drawKeypoints, drawSkeleton } from './utilities';

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [reps, setReps] = useState(0);
  const [camPerm, setCamPerm] = useState(true);
  const [userInFrame, setUserInFrame] = useState(null);

  //  Load posenet
  const runPosenet = async () => {
    const net = await posenet.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.8,
    });
    //
    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Make Detections
      const pose = await net.estimateSinglePose(video);
      // console.log(pose);

      const nose = pose.keypoints.filter((p) => p.part === 'nose')[0];
      const l_eye = pose.keypoints.filter((p) => p.part === 'leftEye')[0];
      const r_eye = pose.keypoints.filter((p) => p.part === 'rightEye')[0];

      const LOWEST_SCORE = 0.1;

      if (
        nose.score < LOWEST_SCORE &&
        l_eye.score < LOWEST_SCORE &&
        r_eye.score < LOWEST_SCORE
      ) {
        setUserInFrame(false);
      } else {
        setUserInFrame(true);
      }

      drawCanvas(pose, video, videoWidth, videoHeight, canvasRef);
    }
  };

  const drawCanvas = (pose, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext('2d');
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    drawKeypoints(pose['keypoints'], 0.6, ctx);
    drawSkeleton(pose['keypoints'], 0.7, ctx);
  };

  runPosenet();

  const disableWebcam = () =>
    camPerm ? setCamPerm(false) : window.location.reload();

  return (
    <div className='App'>
      <h1 style={{ color: '#f36825' }}>FitnessFlow</h1>
      <p
        className='top-banner-label'
        onClick={() => (window.location = 'https://xhacks.live')}
      >
        XHacks 2021
      </p>
      <header className='App-header'>
        {camPerm === false ? (
          <h1>Webcam permission is missing or not installed!</h1>
        ) : (
          <>
            <Webcam
              ref={webcamRef}
              onUserMediaError={() => setCamPerm(false)}
              style={{
                position: 'absolute',
                marginLeft: 'auto',
                marginRight: 'auto',
                left: 0,
                right: 0,
                textAlign: 'center',
                zindex: 9,
                width: 640,
                height: 480,
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                marginLeft: 'auto',
                marginRight: 'auto',
                left: 0,
                right: 0,
                textAlign: 'center',
                zindex: 9,
                width: 640,
                height: 480,
                borderRadius: 5,
              }}
            />{' '}
          </>
        )}
      </header>
      <button className='webcamBtn' onClick={disableWebcam}>
        {camPerm ? 'Disable' : 'Enable'} Webcam
      </button>
      {userInFrame && camPerm ? (
        <h2 className='label'>
          <strong>Reps:</strong> {reps}
        </h2>
      ) : (
        <h2 className='label'>User not in the frame</h2>
      )}
    </div>
  );
}

export default App;
