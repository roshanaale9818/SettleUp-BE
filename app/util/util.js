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
const SETTLEMENT_STATUS = {
    PENDING:"PENDING",
    SETTLED:"SETTLED",
    ACCEPTED:"ACCEPTED"
}
module.exports = {getResponseBody,PAGE_PARAMS,SETTLEMENT_STATUS}