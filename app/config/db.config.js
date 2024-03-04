module.exports = {
    HOST:"localhost",
    USER:"postgres",
    PASSWORD:"Poision@123",
    DB:"expenseshare",
    dialect:"postgres",
    pool:{
        port:25060,
        min:0,//min number of connection
        max:5, //max number of connection
        acquire:30000, //maximum time, in milliseconds, that pool will try to get connection before throwing error
        idle:10000//maximum time, in milliseconds, that a connection can be idle before being released
    }
}