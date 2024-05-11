// script.js

function script_main() {
  console.log("running script main");
  document
    .getElementById("start-audio-capture")
    .addEventListener("click", testAudioCapture);
}

async function testAudioCapture() {
  console.log("testAudioCapture");
  let systemStream = await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: true,
  });
  console.log("system media stream", systemStream);
  let systemTrack = systemStream.getAudioTracks()[0];
  console.log("system audio track", systemTrack);

  let micStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  console.log("mic media stream", micStream);
  let micTrack = micStream.getAudioTracks()[0];
  console.log("mic audio track", micTrack);

  await recordAudio([micTrack, systemTrack]);

  console.log("stopping capture");
  systemStream.getTracks().forEach((track) => track.stop());
  micStream.getTracks().forEach((track) => track.stop());
}

async function recordAudio(tracks) {
  return new Promise((resolve, reject) => {
    const mediaStream = new MediaStream();
    tracks.forEach((track) => mediaStream.addTrack(track));

    const options = { mimeType: "audio/webm" };
    const mediaRecorder = new MediaRecorder(mediaStream, options);
    const audioChunks = [];

    mediaRecorder.ondataavailable = function (event) {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async function () {
      console.log("mediaRecorder.onstop");
      try {
        console.log("creating blob");
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        console.log("creating audio url");
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log("calling playAudio");
        xPlayAudio(audioUrl);
      } catch (error) {
        console.error("error playing audio", error);
      }
    };

    // Start recording
    mediaRecorder.start();

    // Stop recording after 5 seconds
    setTimeout(() => {
      mediaRecorder.stop();
      console.log("finished recording");
      resolve();
    }, 5000);
  });
}

async function xPlayAudio(audioUrl) {
  console.log("playAudio", audioUrl);
  const audio = new Audio(audioUrl);
  audio.play();
}

script_main();
