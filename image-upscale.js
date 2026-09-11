const fileInput = document.getElementById('file-input');
const outputImage = document.getElementById('output-image');
const downloadBtn = document.getElementById('download-btn');
const placeholder = document.querySelector('.preview-placeholder');

let upscaledCanvasData = ""; // Upscaled image dynamic storage

fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        processAndEnhanceImage(file);
    }
});

function processAndEnhanceImage(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        if(placeholder) {
            placeholder.innerHTML = "<p style='color: #d2ff00; font-weight:600;'>AI Upscaling & Enhancing Pixels...</p>";
        }

        const img = new Image();
        img.onload = function() {
            // Create a High-Resolution Canvas (2x Upscale standard)
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Setting upscaled dimensions
            canvas.width = img.width * 2; 
            canvas.height = img.height * 2;

            // Apply Browser-level Image Smoothing and sharpening simulation
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Draw image to 2x size
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Simulation Delay for AI effect
            setTimeout(() => {
                if(placeholder) placeholder.style.display = 'none';
                
                // Export 2x High Quality PNG Data URL
                upscaledCanvasData = canvas.toDataURL('image/png', 1.0);
                
                // Display in Frontend UI
                outputImage.src = upscaledCanvasData;
                outputImage.style.display = 'block';
                outputImage.style.maxWidth = '100%';
                outputImage.style.maxHeight = '250px';
                outputImage.style.borderRadius = '12px';
                outputImage.style.objectFit = 'contain';
                
                // Activate Download Action Button
                downloadBtn.removeAttribute('disabled');
                downloadBtn.classList.add('active');
                downloadBtn.style.cursor = 'pointer';
            }, 2000);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Download Triggering
downloadBtn.addEventListener('click', function() {
    if (upscaledCanvasData) {
        const downloadLink = document.createElement('a');
        downloadLink.href = upscaledCanvasData;
        downloadLink.download = 'oru-design-enhanced-2x.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
});