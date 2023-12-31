import { useEffect, useRef } from "react";

import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import "@mediapipe/face_mesh";

import Webcam from "react-webcam";

export const App1 = () => {
  const webcam = useRef<Webcam>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const runDetection = async () => {
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detectorConfig = {
      runtime: 'mediapipe', 
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
    } as any;
    // create detector
    const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
    // run detection
    await detect(detector);
  };

  const detect = async (detector: any) => {
    try {
      if (webcam.current && canvas.current && detector) {
        const webcamCurrent = webcam.current as any;
        const videoWidth = webcamCurrent.video.videoWidth;
        const videoHeight = webcamCurrent.video.videoHeight;
        canvas.current.width = videoWidth;
        canvas.current.height = videoHeight;
        // go next step only when the video is completely uploaded.
        if (webcamCurrent.video.readyState === 4) {
          const video = webcamCurrent.video;
          const predictions = await detector.estimateFaces(video);
          requestAnimationFrame(() => {
            draw(predictions);
          });
          setTimeout(() => {
            detect(detector);
          }, 250);
        } else {
          setTimeout(() => {
            detect(detector);
          }, 250);
        }
      }
    } catch (error) {
      setTimeout(() => {
        detect(detector);
      }, 250);
    }
  };

  const draw = (predictions: any) => {
    try {
      if (canvas.current) {
        const ctx = canvas.current.getContext("2d");
        if (ctx) {
          predictions.forEach((prediction: any) => {
            drawFaceMesh(ctx, prediction);
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const drawFaceMesh = (ctx: any, prediction: any) => {
    prediction.keypoints.forEach((item: any) => {
      const x = item.x;
      const y = item.y;
      ctx.fillRect(x, y, 2, 2);
      ctx.fillStyle = "#69ffe1";
    });
  };

  useEffect(() => {
    runDetection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webcam.current?.video?.readyState]);

  return (
    <div className="App">
      <header className="header">
        <div className="title">Face Detection</div>
      </header>
      <Webcam
        audio={false}
        ref={webcam}
        style={{
          position: "absolute",
          margin: "auto",
          textAlign: "center",
          top: 50,
          left: 0,
          right: 0,
          right: 0,
        }}
      />
      <canvas
        ref={canvas}
        style={{
          position: "absolute",
          margin: "auto",
          textAlign: "center",
          top: 50,
          left: 0,
          right: 0,
        }}
      />
    </div>
  );
};
