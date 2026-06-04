function downloadVideo() {

    const url = document.getElementById("videoUrl").value.trim();

    if (!url) {
        alert("Please enter a video URL");
        return;
    }

    let serviceUrl = "";

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        serviceUrl = `https://ssyoutube.com/watch?v=${extractYoutubeId(url)}`;
    }
    else if (url.includes("instagram.com")) {
        serviceUrl = `https://snapinsta.app`;
    }
    else if (url.includes("facebook.com")) {
        serviceUrl = `https://fdown.net`;
    }
    else if (url.includes("tiktok.com")) {
        serviceUrl = `https://snaptik.app`;
    }
    else if (url.includes("pinterest.com")) {
        serviceUrl = `https://experte.com/pinterest-video-downloader`;
    }
    else {
        serviceUrl = `https://en.savefrom.net/#url=${encodeURIComponent(url)}`;
    }

    window.open(serviceUrl, "_blank");
}

function extractYoutubeId(url) {

    const regExp =
        /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=))([^#&?]*).*/;

    const match = url.match(regExp);

    return (match && match[7].length === 11)
        ? match[7]
        : "";
}