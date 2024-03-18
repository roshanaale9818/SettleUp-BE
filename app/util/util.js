const getResponseBody =(status,message,data=[])=>{
    return {
        status,
        message,
        data
    }
};
module.exports = {getResponseBody}