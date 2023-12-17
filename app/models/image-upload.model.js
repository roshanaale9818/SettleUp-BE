module.exports = (sequelize, Sequelize) => {
    const ImageUpload = sequelize.define("images", {
        filename: {
            type: Sequelize.STRING,
            allowNull: false
        },
        image_url: {
            type: Sequelize.STRING,
            allowNull: false

        },
        type: {
            type: Sequelize.STRING,
            allowNull: false
        }
        
        

    });

    return ImageUpload;
};