var video = document.querySelector("#videoElement");

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;
      console.log('stream', stream)
    })
    .catch(function (err0r) {
      console.log("Something went wrong!");
    });
}

async function loadModels() { 
  const faceDetectionNet = faceapi.nets.ssdMobilenetv1;

  await faceDetectionNet.loadFromUri('./models')
  await faceapi.nets.faceLandmark68Net.loadFromUri('./models')
  await faceapi.nets.faceRecognitionNet.loadFromUri('./models')
  await faceapi.nets.ageGenderNet.load('./models')
 }

 

console.log('faceapi', faceapi)

const SSD_MOBILENETV1 = 'ssd_mobilenetv1'
const TINY_FACE_DETECTOR = 'tiny_face_detector'

function getCurrentFaceDetectionNet() {
  return faceapi.nets.ssdMobilenetv1 || {}
}

function isFaceDetectionModelLoaded() {
  return !!getCurrentFaceDetectionNet().params
}

// ssd_mobilenetv1 options
let minConfidence = 0.5

// tiny_face_detector options
let inputSize = 512
let scoreThreshold = 0.5

function getFaceDetectorOptions() {
  return new faceapi.SsdMobilenetv1Options({ minConfidence })
}

loadModels();
let predictedAges = [];

function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30)
  const avgPredictedAge = predictedAges.reduce((total, a) => total + a) / predictedAges.length
  return avgPredictedAge
}


async function onPlay() {
  console.log('started detecting');

  const videoEl = document.getElementById('videoElement')

  if(videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded())
    return setTimeout(() => {
      onPlay();
      console.log('play again')
    }, 1000)

    // await loadModels();


  const options = getFaceDetectorOptions()

  const ts = Date.now()

  const result = await faceapi.detectSingleFace(videoEl, options)
    .withAgeAndGender();
  console.log('finished detecting');


  if (result) {
    console.log('faces detected');
    
    const canvas = document.getElementById('overlay')
    const dims = faceapi.matchDimensions(canvas, videoEl, true)

    const resizedResult = faceapi.resizeResults(result, dims)
    // if (withBoxes) {
      faceapi.draw.drawDetections(canvas, resizedResult)
    // }
    const { age, gender, genderProbability } = resizedResult

    // interpolate gender predictions over last 30 frames
    // to make the displayed age more stable
    const interpolatedAge = interpolateAgePredictions(age)
    new faceapi.draw.DrawTextField(
      [
        `${faceapi.utils.round(interpolatedAge, 0)} years`,
        `${gender} (${faceapi.utils.round(genderProbability)})`
      ],
      result.detection.box.bottomLeft
    ).draw(canvas)
  } else {
    console.log('failed detection');
  }

  setTimeout(() => onPlay())
}

