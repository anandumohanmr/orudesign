const generateBtn =
document.getElementById("generateBtn");

const promptInput =
document.getElementById("promptInput");

const imageGrid =
document.getElementById("imageGrid");

/* PEXELS API */

const API_KEY =
"qPwYsXbmtXTHTs6U46CDHa5nNk8gbo1tkujswIJIJIvyK4RF8mSJUYHf";

/* TAG BUTTONS */

const tagButtons =
document.querySelectorAll(".tag-btn");

tagButtons.forEach(button => {

    button.addEventListener("click", () => {

        promptInput.value =
        button.innerText;

    });

});

/* GENERATE */

generateBtn.addEventListener("click", async () => {

    const prompt =
    promptInput.value.trim();

    if(!prompt){

        alert("Enter prompt");

        return;

    }

    generateBtn.innerText =
    "SEARCHING...";

    generateBtn.disabled =
    true;

    imageGrid.innerHTML = "";

    try{

        /* FETCH FROM PEXELS */

        const response =
        await fetch(

        `https://api.pexels.com/v1/search?query=${prompt}&per_page=6`,

        {

            headers:{

                Authorization:API_KEY

            }

        });

        const data =
        await response.json();

        /* CHECK */

        if(data.photos.length > 0){

            data.photos.forEach(photo => {

                const img =
                document.createElement("img");

                img.src =
                photo.src.large2x;

                imageGrid.appendChild(img);

            });

        }

        else{

            imageGrid.innerHTML =
            "<h2>No Images Found</h2>";

        }

    }

    catch(error){

        console.log(error);

        alert("Something went wrong");

    }

    generateBtn.innerText =
    "GENERATE";

    generateBtn.disabled =
    false;

});