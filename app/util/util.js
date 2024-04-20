const getResponseBody =(status,message,data=[])=>{
    return {
        status,
        message,
        data
    }
};
const PAGE_PARAMS = {
        DEFAULT_PAGE_SIZE:10,
        DEFAULT_PAGE_LIMIT:10
}
module.exports = {getResponseBody,PAGE_PARAMS}