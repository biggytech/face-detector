import * as faceapi from 'face-api.js';

class FaceRecognition {
    static MODELS_PATH = './lib/models';
    static MIN_CONFIDENCE = 0.5;
    static RECOGNITION_TIMEOUT_MS = 200;
    static PREDICTED_AGES_FRAME_COUNT = 30;

    videoElement: HTMLVideoElement;
    overlayElement: HTMLCanvasElement;
    options: faceapi.SsdMobilenetv1Options;
    predictedAges: number[] = [];

    static async loadModels() {
        const faceDetectionNet = faceapi.nets.ssdMobilenetv1;
  
        await faceDetectionNet.loadFromUri(FaceRecognition.MODELS_PATH);
        await faceapi.nets.ageGenderNet.load(FaceRecognition.MODELS_PATH);
    }

    static get isFaceDetectionModelLoaded(): boolean {
        return !!faceapi.nets.ssdMobilenetv1?.params;
    }

    interpolateAgePredictions(age: number) {
        this.predictedAges = [age].concat(this.predictedAges).slice(0, FaceRecognition.PREDICTED_AGES_FRAME_COUNT);
        const avgPredictedAge = this.predictedAges.reduce((total, a) => total + a) / this.predictedAges.length;
        return avgPredictedAge;
      }
    
    constructor(videoElement: HTMLVideoElement, overlayElement: HTMLCanvasElement) {
        this.videoElement = videoElement;
        this.overlayElement = overlayElement;

        this.options = new faceapi.SsdMobilenetv1Options({ minConfidence: FaceRecognition.MIN_CONFIDENCE });

        FaceRecognition.loadModels();
    }    

    async recognizeFaces() {   
        try {
            if(this.videoElement.paused || this.videoElement.ended || !FaceRecognition.isFaceDetectionModelLoaded) {
                return setTimeout(() => {
                    this.recognizeFaces();
                  }, 1000);
            }          
          
            const result = await faceapi.detectSingleFace(this.videoElement, this.options).withAgeAndGender();
          
            if (result) {          
                const dims = faceapi.matchDimensions(this.overlayElement, this.videoElement, true);
          
                const resizedResult = faceapi.resizeResults(result, dims);
                faceapi.draw.drawDetections(this.overlayElement, resizedResult);
                const { age, gender, genderProbability } = resizedResult;      
              
                const interpolatedAge = this.interpolateAgePredictions(age);
                new faceapi.draw.DrawTextField(
                    [
                        `${faceapi.utils.round(interpolatedAge, 0)} years`,
                        `${gender} (${faceapi.utils.round(genderProbability)})`
                    ],
                    result.detection.box.bottomLeft
                ).draw(this.overlayElement);
            } else {
                console.log('Failed face recognition');
            }
          
            setTimeout(() => this.recognizeFaces(), FaceRecognition.RECOGNITION_TIMEOUT_MS);
        } catch(err) {
            console.log(err);
            await FaceRecognition.loadModels();
            this.recognizeFaces();
        }
    }
}

export default FaceRecognition;