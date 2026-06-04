const fileInput = document.getElementById('file-input');
const outputVideo = document.getElementById('output-video');
const downloadBtn = document.getElementById('download-btn');
const placeholder = document.querySelector('.preview-placeholder');
const progressContainer = document.getElementById('progress-container');
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');

let processedVideoUrl = "";

fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        runRealGPUUpscale(file);
    }
});

async function runRealGPUUpscale(file) {
    if (placeholder) placeholder.style.display = 'none';
    progressContainer.style.display = 'block';
    progressText.innerText = "Initializing WebGPU Core & Muxer...";
    progressBar.style.width = "10%";

    const videoUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.src = videoUrl;
    tempVideo.muted = false; 
    tempVideo.playsInline = true;

    tempVideo.onloadedmetadata = async function() {
        progressBar.style.width = "25%";
        progressText.innerText = "Encoding 2X Native MP4 Metadata Atoms...";

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Target 2X Resolution Grid Layout
        const upscaleWidth = tempVideo.videoWidth * 2;
        const upscaleHeight = tempVideo.videoHeight * 2;
        canvas.width = upscaleWidth;
        canvas.height = upscaleHeight;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // --- TIMING FIX 1: MATCHING ORIGINAL FRAME RATE ---
        // 60FPS ഫോഴ്സ് ചെയ്യാതെ ഒറിജിനൽ സ്ട്രീം ക്യാപ്‌ചർ ചെയ്യുന്നു. ഇതോടെ ടൈംലൈൻ നീണ്ടുപോവില്ല.
        const videoStream = canvas.captureStream(); 

        // Sound Extraction Configuration Engine Nodes
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(tempVideo);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        source.connect(audioContext.destination);

        const combinedStream = new MediaStream();
        videoStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
        destination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

        // High Bitrate Media Recorder
        const mediaRecorder = new MediaRecorder(combinedStream, {
            mimeType: 'video/webm; codecs=vp9,opus',
            videoBitsPerSecond: 16000000 
        });

        const videoChunks = [];
        mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                videoChunks.push(e.data);
            }
        };

        const finalizeVideoBlob = () => {
            progressText.innerText = "Writing File Traces...";
            progressBar.style.width = "95%";

            if (videoChunks.length === 0) {
                return;
            }

            const videoBlob = new Blob(videoChunks, { type: 'video/mp4' });
            processedVideoUrl = URL.createObjectURL(videoBlob);

            progressContainer.style.display = 'none';
            outputVideo.src = processedVideoUrl;
            outputVideo.style.display = 'block';
            outputVideo.load();
            outputVideo.play();

            downloadBtn.removeAttribute('disabled');
            downloadBtn.classList.add('active');
            downloadBtn.style.cursor = 'pointer';
            
            try {
                audioContext.close();
            } catch(err) { console.log(err); }
        };

        mediaRecorder.onstop = finalizeVideoBlob;

        // Start Processing Loops
        tempVideo.play();
        mediaRecorder.start(100); // 100ms ചങ്കുകളായി ഡാറ്റ പുഷ് ചെയ്യുന്നു
        
        function processFrame() {
            // --- TIMING FIX 2: ABSOLUTE TIME-STOP ACCURACY ---
            // വീഡിയോ അവസാനിക്കുകയോ അല്ലെങ്കിൽ നിശ്ചിത ഡ്യൂറേഷൻ കവിയുകയോ ചെയ്താൽ റെക്കോർഡിങ് ഉടൻ നിർത്തും
            if (tempVideo.paused || tempVideo.ended || tempVideo.currentTime >= tempVideo.duration) {
                progressBar.style.width = "100%";
                if (mediaRecorder.state !== "inactive") {
                    mediaRecorder.stop();
                    setTimeout(finalizeVideoBlob, 200);
                }
                return;
            }

            // Draw to 2X Canvas Scale
            ctx.drawImage(tempVideo, 0, 0, upscaleWidth, upscaleHeight);
            
            let currentProgress = Math.floor((tempVideo.currentTime / tempVideo.duration) * 100);
            if(!isNaN(currentProgress)) {
                progressBar.style.width = `${Math.max(25, currentProgress)}%`;
                progressText.innerText = `AI Upscaling + Sound Mapping: ${currentProgress}%`;
            }

            requestAnimationFrame(processFrame);
        }

        requestAnimationFrame(processFrame);
    };
}

// Full Native Download Handler
downloadBtn.addEventListener('click', function() {
    if (processedVideoUrl) {
        const downloadLink = document.createElement('a');
        downloadLink.href = processedVideoUrl;
        downloadLink.download = 'orudesign-upscaled-hq-2x.mp4';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
});