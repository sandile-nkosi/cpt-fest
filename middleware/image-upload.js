const multer = require("multer");
const uuid = require("uuid").v4;

const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/event-data/images/',
    filename: (req, file, cb)=>{
      cb(null, uuid() + '-' + file.originalname);
    }
  })
});


const configuredMulterMiddleware = upload.single('eventImage');

module.exports = configuredMulterMiddleware;