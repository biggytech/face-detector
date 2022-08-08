import { setWebcamStream } from './videoUtils';
import FaceRecognition from './FaceRecognition';

const VIDEO_EL_SELECTOR = '.js-video';
const LOADER_EL_SELECTOR = '.js-loader';
const OVERLAY_EL_SELECTOR = '.js-overlay';

document.addEventListener('DOMContentLoaded', () => {
  const videoElement: HTMLVideoElement = document.querySelector(VIDEO_EL_SELECTOR);

  if (videoElement) {
    if (navigator.mediaDevices.getUserMedia) {
      setWebcamStream(videoElement);
    }

    videoElement.addEventListener('loadedmetadata', () => {
      const loaderElement: HTMLDivElement = document.querySelector(LOADER_EL_SELECTOR);
      const overlayElement: HTMLCanvasElement = document.querySelector(OVERLAY_EL_SELECTOR);

      if (loaderElement) {
        loaderElement.style.display = 'none';
      }

      if (overlayElement) {
        new FaceRecognition(videoElement, overlayElement).recognizeFaces();
      }      
    });
  }  
});
