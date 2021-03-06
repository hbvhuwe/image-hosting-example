import makeCallback from '@hbvhuwe/image-hosting-commons/express-callback.js';
import express from 'express';
import fs from 'fs';
import multer from 'multer';

import imageController from './controllers/index.js';

const volumes = fs.readdirSync('/images');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const destinations = [];

    volumes.forEach(volume => {
      destinations.push(
          fs.promises.readdir('/images/' + volume)
              .then(files => ['/images/' + volume, files.length]));
    });

    Promise.all(destinations).then(dests => {
      let dest = dests[0][0];
      let min = dests[0][1];

      dests.forEach(destination => {
        if (destination[1] < min) {
          dest = destination[0];
        }
      });

      cb(null, dest);
    });
  },
});

const app = express();
const upload = multer({storage});

// upload image api
app.post(
    '/images', upload.single('file'),
    makeCallback(imageController.makeUploadImage));

app.listen(80, () => {
  console.log('Service is listening');
});
