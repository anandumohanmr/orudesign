const fileInput = document.getElementById('file-input');
const outputImage = document.getElementById('output-image');
const downloadBtn = document.getElementById('download-btn');
const placeholder = document.querySelector('.preview-placeholder');
const dropZone = document.getElementById('drop-zone');
const scaleButtons = document.querySelectorAll('.scale-btn');

let upscaledCanvasData = ""; // Upscaled image dynamic storage
let currentScale = 4; // Default upscale factor

// Max output pixels guard (width * height) so we don't blow past
// browser canvas limits or hand the user a multi-hundred-MB PNG.
const MAX_OUTPUT_PIXELS = 40000000; // ~40MP output, e.g. 8000x5000

// ---------- Scale factor selection ----------
scaleButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        scaleButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentScale = parseInt(btn.dataset.scale, 10);
    });
});

// ---------- File input (Browse button) ----------
fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        processAndEnhanceImage(file);
    }
});

// ---------- Drag & drop wiring ----------
['dragenter', 'dragover'].forEach(function (eventName) {
    dropZone.addEventListener(eventName, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    });
});

['dragleave', 'dragend'].forEach(function (eventName) {
    dropZone.addEventListener(eventName, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
    });
});

dropZone.addEventListener('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');

    const files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length > 0) {
        const file = files[0];
        if (file.type && file.type.startsWith('image/')) {
            processAndEnhanceImage(file);
        } else {
            if (placeholder) {
                placeholder.style.display = 'block';
                placeholder.innerHTML = "<p style='color:#ff6b6b;'>Please drop an image file.</p>";
            }
        }
    }
});

function processAndEnhanceImage(file) {
    const scale = currentScale || 2;
    const reader = new FileReader();

    reader.onload = function (event) {
        // Reset preview state for a fresh run
        outputImage.style.display = 'none';
        downloadBtn.setAttribute('disabled', 'true');
        downloadBtn.classList.remove('active');

        if (placeholder) {
            placeholder.style.display = 'block';
            placeholder.innerHTML = "<p style='color: #d2ff00; font-weight:600;'>AI Upscaling & Enhancing Pixels...</p>";
        }

        const img = new Image();
        img.onload = function () {
            const targetWidth = img.width * scale;
            const targetHeight = img.height * scale;

            if (targetWidth * targetHeight > MAX_OUTPUT_PIXELS) {
                if (placeholder) {
                    placeholder.innerHTML = "<p style='color:#ff6b6b;'>Image too large for that upscale factor. Try a smaller image or a lower scale.</p>";
                }
                return;
            }

            // Simulation delay for the "AI" effect
            setTimeout(function () {
                const finalCanvas = upscaleImage(img, scale);

                if (placeholder) placeholder.style.display = 'none';

                upscaledCanvasData = finalCanvas.toDataURL('image/png');

                outputImage.src = upscaledCanvasData;
                outputImage.style.display = 'block';
                outputImage.style.maxWidth = '100%';
                outputImage.style.maxHeight = '250px';
                outputImage.style.borderRadius = '12px';
                outputImage.style.objectFit = 'contain';

                downloadBtn.removeAttribute('disabled');
                downloadBtn.classList.add('active');
                downloadBtn.style.cursor = 'pointer';
                downloadBtn.dataset.scale = scale;
            }, 900);
        };
        img.onerror = function () {
            if (placeholder) {
                placeholder.style.display = 'block';
                placeholder.innerHTML = "<p style='color:#ff6b6b;'>Couldn't read that image. Try a different file.</p>";
            }
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Upscales `img` to `scale`x its original size. Jumping straight from
// 1x to 4x in a single drawImage() call makes the browser interpolate
// over a huge gap in one pass, which looks soft/blurry. Doing it in
// steps of at most 2x per pass (and a final pass for any remainder,
// e.g. 3x) keeps each interpolation step small and the result sharper.
function upscaleImage(img, scale) {
    let currentWidth = img.width;
    let currentHeight = img.height;

    let sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = currentWidth;
    sourceCanvas.height = currentHeight;
    sourceCanvas.getContext('2d').drawImage(img, 0, 0);

    let remainingScale = scale;

    while (remainingScale > 1) {
        const stepScale = Math.min(2, remainingScale);
        const nextWidth = Math.round(currentWidth * stepScale);
        const nextHeight = Math.round(currentHeight * stepScale);

        const stepCanvas = document.createElement('canvas');
        stepCanvas.width = nextWidth;
        stepCanvas.height = nextHeight;

        const ctx = stepCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(sourceCanvas, 0, 0, nextWidth, nextHeight);

        sourceCanvas = stepCanvas;
        currentWidth = nextWidth;
        currentHeight = nextHeight;
        remainingScale = remainingScale / stepScale;
    }

    return sourceCanvas;
}

// ---------- Download ----------
downloadBtn.addEventListener('click', function () {
    if (upscaledCanvasData) {
        const scale = downloadBtn.dataset.scale || currentScale;
        const downloadLink = document.createElement('a');
        downloadLink.href = upscaledCanvasData;
        downloadLink.download = 'oru-design-enhanced-' + scale + 'x.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
});
