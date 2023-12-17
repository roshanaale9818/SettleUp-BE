const db = require("../models");
const ImageUpload = db.imageupload;
const directory = require('../../server').dir;
// const FileType = require('file-type');
exports.uploadImage = async (req, res) => {
  // Save the image metadata to the database
  // saveImageMetadata(req.file.originalname, imageUrl);
  if(!req.file){
    res.send({ status: "error", message: "Error uploading image" });
    return;
  }
  // console.log("THis is type",req)
  const { filename } = req.file;

  if(!filename){
    res.send({ status: "error", message: "Error uploading image" });
    return;
  }
  // const fileType = await FileType.fromBuffer(buffer);

  // if (!fileType || !fileType.mime.startsWith('image/')) {
  //     // Invalid file type; respond with an error
  //     return res.status(400).json({ error: 'Invalid file type. Please upload an image.' });
  // }
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  // Generate the URL for the file using the filename
  // const filePath = `/uploads/${filename}`;

  // Create a new file record in the database with the URL
  let object = {
    filename: filename,
    image_url: imageUrl,
    type: req.body.type ? req.body.type:'aboutme'
  }
  const file = await ImageUpload.create({
    ...object
  }).then((data) => {
    return res.send({ status: "ok", message: "Data saved successfull." })
  }).catch(err => {
    res.send({ status: "error", message: err });
  })
}
exports.getImage = async(req,res)=>{
    const {type}=req.body;
    if(!type){
    res.send({ status: "error", message: "Couldnot find the type" });
    }
    else{
      await ImageUpload.findAll({
        where: {
          type: type
        }
      }).then((data) => {
        return res.send({ status: "ok", data: data ?data[0]:[] })
      }).catch(err => {
        res.send({ status: "error", message: err });
      })
    }
}

exports.getImagesList = async(req,res)=>{
    await ImageUpload.findAll({
      where: {
      }
    }).then((data) => {
      return res.send({ status: "ok", data: data && data.length>0 ?data:[] })
    }).catch(err => {
      res.send({ status: "error", message: err });
    })
}


const fs = require('fs');
const path = require('path');



exports.deleteImage = async(req,res)=>{
  // console.log("params",req.qjuery)
  const {id} = req.query;
  if(!id){
    res.send({ status: "error", message: "Id is required." });
  }
  else{
    try {
      const image = await ImageUpload.findByPk(id);
  
      if (!image) {
        return res.status(200).json({status:'error', message: 'Image not found' });
      }
  
      // Delete the image file from the server
      const imagePath = path.join(directory, 'uploads', image.filename);
      fs.unlinkSync(imagePath);
  
      // Delete the image record from the database
      await image.destroy();
  
      return  res.status(200).json({status:'ok', message: 'Deleted successfully.' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error; Something went wrong in deleting image;' });
    }
  }


}





