module.exports = function(sequelize, Sequalize) {
    var BillSchema = sequelize.define("Bill", {
        id_student: Sequalize.STRING,
        service: Sequalize.STRING,
        amount: Sequalize.FLOAT,
        date: Sequalize.DATE,
        paid: Sequalize.BOOLEAN
    },{
        timestamps: false
    });
    return BillSchema;
}