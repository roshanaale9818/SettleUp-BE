const db = require('../models');
const { getResponseBody } = require('../util/util');
const Expense = db.expense;
exports.addExpense = async (req, res) => {
    try {
        const {body}= req;
        console.log(body);
        const result = await Expense.create({
            body
        });
        if(!result){
        return res.status(400).send(getResponseBody('error',"Expense addition failed.",result))
        }
        return res.status(200).send(getResponseBody('ok',"Expense added successfull.",result))
    }
    catch (error) {
        // console.log("errr",err.message)
        if (error.name === 'SequelizeValidationError' || error.name ===
            'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            return res.status(400).json({ status: "error", errors });
        }
        else {
            return res.status(500).send(getResponseBody('error', error.message, []));

        }
    }
}