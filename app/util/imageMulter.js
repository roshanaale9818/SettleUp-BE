const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/'); // Save uploads in the 'uploads' folder
    },
    filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.originalname.split('.').pop();
        callback(null, uniqueSuffix + '.' + extension);
    },
});

const imageUploadWithMulter = multer({ storage: storage });

module.exports = imageUploadWithMulter;