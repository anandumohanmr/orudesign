const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "backend/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

app.get("/", (req, res) => {
    res.send("ORU Video Upscale API Running");
});

app.post("/upload", upload.single("video"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No video uploaded"
        });
    }

    res.json({
        success: true,
        filename: req.file.filename
    });

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

--------------------------------------
