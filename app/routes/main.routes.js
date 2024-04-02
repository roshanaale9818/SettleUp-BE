const authRoutes = require('./auth.routes');
const groupRoutes = require('./group.routes');
const imageUpload = require('./image-upload.routes');
const userRoutes = require('./user.routes');
const expenseRoutes = require('./expense.routes');
module.exports =  function(app){
        authRoutes(app);
        groupRoutes(app);
        userRoutes(app);
        expenseRoutes(app);
};