function downloadImage() {

    const url = document
        .getElementById("imageUrl")
        .value
        .trim();

    const result =
        document.getElementById("preview");

    if (!url) {

        result.innerHTML = `
            <p style="color:red;">
                Please enter an image URL
            </p>
        `;

        return;
    }

    // Direct Image File

    if (
        url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
    ) {

        result.innerHTML = `
            <img
                src="${url}"
                style="
                max-width:500px;
                border-radius:12px;
                margin-top:20px;
                ">
        `;

        const link =
            document.createElement("a");

        link.href = url;
        link.download = "image";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return;
    }

    // Instagram

    if (
        url.includes("instagram.com")
    ) {

        result.innerHTML = `
            <p style="color:#dfff00;">
                Opening Instagram Downloader...
            </p>
        `;

        window.open(
            "https://snapinsta.to",
            "_blank"
        );

        return;
    }

    // Facebook

    if (
        url.includes("facebook.com")
    ) {

        result.innerHTML = `
            <p style="color:#dfff00;">
                Opening Facebook Downloader...
            </p>
        `;

        window.open(
            "https://fdown.net",
            "_blank"
        );

        return;
    }

    // Pinterest

    if (
        url.includes("pinterest.com")
    ) {

        result.innerHTML = `
            <p style="color:#dfff00;">
                Opening Pinterest Downloader...
            </p>
        `;

        window.open(
            "https://experte.com/pinterest-video-downloader",
            "_blank"
        );

        return;
    }

    // Behance

    if (
        url.includes("behance.net")
    ) {

        result.innerHTML = `
            <p style="color:#dfff00;">
                Opening Behance Page...
            </p>
        `;

        window.open(
            url,
            "_blank"
        );

        return;
    }

    // Google Images

    if (
        url.includes("google.")
    ) {

        result.innerHTML = `
            <p style="color:#dfff00;">
                Opening Google Image...
            </p>
        `;

        window.open(
            url,
            "_blank"
        );

        return;
    }

    // Default

    result.innerHTML = `
        <p style="color:#dfff00;">
            Opening URL...
        </p>
    `;

    window.open(
        url,
        "_blank"
    );
}