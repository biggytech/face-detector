function setWebcamStream(videoElement: HTMLVideoElement) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            videoElement.srcObject = stream;
            console.log('stream', stream)
        })
        .catch(function (err) {
            console.error(err);
        });
}

export { setWebcamStream };