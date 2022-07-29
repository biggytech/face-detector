// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
// require('@tensorflow/tfjs-node');

const faceapi = require('face-api.js');
const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, './out')

// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
const canvas = require('canvas')

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const faceDetectionNet = faceapi.nets.ssdMobilenetv1;

const WEIGHTS_PATH = './weights';
const IMAGE_PATH = './images/me1.jpg';

// SsdMobilenetv1Options
const minConfidence = 0.5

// TinyFaceDetectorOptions
const inputSize = 408
const scoreThreshold = 0.5

function getFaceDetectorOptions(net) {
  return net === faceapi.nets.ssdMobilenetv1
    ? new faceapi.SsdMobilenetv1Options({ minConfidence })
    : new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
}

function saveFile(fileName, buf) {
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir)
  }

  fs.writeFileSync(path.resolve(baseDir, fileName), buf)
}

const faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet)

async function run() {
  await faceDetectionNet.loadFromDisk(WEIGHTS_PATH)
  await faceapi.nets.faceLandmark68Net.loadFromDisk(WEIGHTS_PATH)
  await faceapi.nets.faceRecognitionNet.loadFromDisk(WEIGHTS_PATH)

  const referenceImage = await canvas.loadImage(IMAGE_PATH)

  const resultsRef = await faceapi.detectAllFaces(referenceImage, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptors()

    const faceMatcher = new faceapi.FaceMatcher(resultsRef)

    const labels = faceMatcher.labeledDescriptors
    .map(ld => ld.label)
  const refDrawBoxes = resultsRef
    .map(res => res.detection.box)
    .map((box, i) => new faceapi.draw.DrawBox(box, { label: labels[i] }))
  const outRef = faceapi.createCanvasFromMedia(referenceImage)
  refDrawBoxes.forEach(drawBox => drawBox.draw(outRef))

  saveFile('referenceImage.jpg', (outRef).toBuffer('image/jpeg'))
}

run();