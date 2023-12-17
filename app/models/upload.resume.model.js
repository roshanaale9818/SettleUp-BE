module.exports = (sequelize, Sequelize) => {
    const UploadResumeModel = sequelize.define("resume", {
        content_type: {
            type: Sequelize.STRING,
            allowNull: false
        },
        filename: {
            type: Sequelize.STRING,
            allowNull: false
        },
        file_size: {
            type: Sequelize.STRING,
            allowNull: false
        },
        file_data:{
            type:Sequelize.BLOB,
            allowNull:false
        }
    //     filename VARCHAR(255) NOT NULL,
    // content_type VARCHAR(255) NOT NULL,
    // file_size INT NOT NULL
        // name: {
        //     type: Sequelize.STRING,
        //     allowNull: false

        // },
        // icon: {
        //     type: Sequelize.STRING,
        //     allowNull: false
        // }
    });

    return UploadResumeModel;
};