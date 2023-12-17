const db = require("../models");
const UploadResume = db.uploadResume;
const isRequiredMessage = require("../util/validateRequest");
// const UploadResume = db.

exports.saveResume = async (req, res) => {

    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    else {
        try {
            const { originalname, mimetype, size, buffer } = file;
            const object = {
                filename: originalname,
                content_type: mimetype,
                file_size: size,
                file_data: buffer
            };

            //delete all the records before and store new.
            const value = await UploadResume.destroy({where:{}});
            console.log("value", value);

            UploadResume.create({
                ...object
            }).then((data) => {
                return res.send({ status: "ok", message: "Data saved successfull." })
            }).catch(err => {
                res.send({ status: "error", message: err })
            })
        }
        catch (err) {
            console.error(err);
            res.send({ status: 'error', message: "Internal server error has occured." })
        }

    }
};
exports.downloadResume = (req, res) => {
try{
    
    UploadResume.findAll({

    }).then((resume) => {
        console.log("this is got in task", resume);
        // Send the file as a response
        const file = resume ? resume[resume.length - 1] : null;
        if (!file) {
            res.send({ status: "error", data: "File not found" });
        }
        else {
            try{
            const { filename, content_type, file_data } = file;
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
            res.setHeader('Content-Type', content_type);
            const pdfBuffer = Buffer.from(file_data, 'utf-8');
            // Set Content-Disposition header to force download
            // res.setHeader('Content-Disposition', 'attachment; filename=downloaded-file.pdf');
            // Set Content-Type header for PDF files
            res.setHeader('Content-Type', 'application/pdf');
            // Send the PDF buffer as response
            res.end(pdfBuffer);
            }
            catch (err){
                res.send({status:'error',message:'500 Internal Server Error'})
            }

            
  
        }
    });
}
catch (err){
    res.send({status:'error',message:"Internal Error has occured."})
}
}

exports.getAllResume = async (req, res) => {
    try{
        
       const result = await UploadResume.findAll({});
    //    const data = result.
       console.log('result',result);
       if(result && result.length >0){
        res.send({status:'ok',data:result});

       }
       else{
        res.send({status:'ok',data:[]});
       }
    }
    catch (err){
        res.send({status:'error',message:"Internal Error has occured."})
    }
    }

