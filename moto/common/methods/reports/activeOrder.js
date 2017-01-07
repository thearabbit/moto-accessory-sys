import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/common/collections/company';
import {Branch} from '../../../../core/common/collections/branch';
import {Exchange} from '../../../../core/common/collections/exchange';
import {Customer} from '../../collections/customer';
import {Order} from '../../collections/order';

export const activeOrderReport = new ValidatedMethod({
    name: 'moto.activeOrderReport',
    mixins: [CallPromiseMixin],
    validate: null,
    run(params) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(100);

            let rptTitle, rptHeader, rptContent, rptFooter;
            // let date = moment(params.repDate).add(1, 'days').toDate();
            let date = moment(params.repDate).endOf('days').toDate();

            // --- Title ---
            rptTitle = Company.findOne();

            // --- Header ---
            // Branch
            let branchDoc = Branch.find({_id: {$in: params.branchId}});
            params.branchHeader = _.map(branchDoc.fetch(), function (val) {
                return `${val._id} : ${val.enName}`;
            });

            // Exchange
            // let exchangeDoc = Exchange.findOne(params.exchangeId);
            // params.exchangeHeader = JSON.stringify(exchangeDoc.rates, null, ' ');
            params.exchangeHeader = "KHR";

            //Customer
            let customerDoc = Customer.findOne(params.customerId);
            params.customerHeader = _.isUndefined(customerDoc) ? "All" : `${customerDoc._id} : ${customerDoc.name}`;

            rptHeader = params;

            // --- Content ---
            let selector = {};
            selector.branchId = {$in: params.branchId};
            selector.orderDate = {$lte: date};
            selector.$or = [{
                closedDate: {
                    $not: {
                        $lte: date
                    }
                }
            }, {
                closedDate: {
                    $eq: ""
                }
            }];

            if (!_.isUndefined(params.customerId)) selector.customerId = params.customerId;

            rptContent = Order.aggregate([
                {
                    $match: selector
                },
                {
                    $lookup: {
                        from: "moto_customer",
                        localField: "customerId",
                        foreignField: "_id",
                        as: "customerDoc"
                    }
                },
                {
                    $unwind: "$customerDoc"
                },
                {
                    $lookup: {
                        from: "core_branch",
                        localField: "branchId",
                        foreignField: "_id",
                        as: "branchDoc"
                    }
                },
                {
                    $unwind: "$branchDoc"
                },
                {$sort: {_id: -1}},
                {
                    $lookup: {
                        from: "moto_orderPayment",
                        localField: "_id",
                        foreignField: "orderId",
                        as: "orderPaymentDoc"
                    }
                },

                {
                    $unwind: {path: "$orderPaymentDoc", preserveNullAndEmptyArrays: true}
                },
                {
                    $group: {
                        _id: "$_id",
                        orderDate: {$last: "$orderDate"},
                        branchId: {$last: "$branchId"},
                        branchDoc: {$last: "$branchDoc"},
                        employeeId: {$last: "$employeeId"},
                        customerId: {$last: "$customerId"},
                        customerDoc: {$last: "$customerDoc"},
                        type: {$last: "$type"},
                        items: {$last: "$items"},
                        subTotal: {$last: "$subTotal"},
                        discountAmount: {$last: "$discountAmount"},
                        total: {$last: "$total"},
                        lastOrderBalance:{$last:"$lastOrderBalance"},
                        orderBalance: {$last:"$balance"},
                        paid: {
                            $sum: {
                                $cond: [{
                                    $and: [{$ne: ["$orderPaymentDoc", null]},
                                        {$eq: ["$orderPaymentDoc.status", "Partial"]}
                                    ]
                                },
                                    "$orderPaymentDoc.paidAmount",
                                    0]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id:1,
                        orderDate:1,
                        branchId:1,
                        branchDoc:1,
                        employeeId:1,
                        customerId:1,
                        customerDoc:1,
                        type:1,
                        items:1,
                        subTotal:1,
                        discountAmount:1,
                        total:1,
                        lastOrderBalance:1,
                        orderBalance:1,
                        paid:1,
                        balance : {$subtract:["$orderBalance", "$paid"]}
                    }
                },
                {
                    $group: {
                        _id: {
                            day: {$dayOfMonth: "$orderDate"},
                            month: {$month: "$orderDate"},
                            year: {$year: "$orderDate"},
                            branchId: "$branchId"
                        },
                        orderDate: {$last: "$orderDate"},
                        branchDoc: {$last: "$branchDoc"},
                        subTotal: {$sum: "$subTotal"},
                        discountAmount: {$sum: "$discountAmount"},
                        total: {$sum: "$total"},
                        lastOrderBalance: {$sum: "$lastOrderBalance"},
                        paid: {$sum: "$paid"},
                        balance: {$sum: "$balance"},
                        dataOrder: {$push: "$$ROOT"}
                    }
                },
                {
                    $project: {
                        _id: 0,
                        branchId: "$_id.branchId",
                        branchDoc: 1,
                        orderDate: 1,
                        subTotal: 1,
                        discountAmount: 1,
                        total: 1,
                        lastOrderBalance: 1,
                        paid: 1,
                        balance: 1,
                        dataOrder: 1
                    }
                },
                {
                    $group: {
                        _id: "$branchId",
                        orderDate: {$last: "$orderDate"},
                        branchDoc: {$last: "$branchDoc"},
                        subTotal: {$sum: "$subTotal"},
                        discountAmount: {$sum: "$discountAmount"},
                        total: {$sum: "$total"},
                        lastOrderBalance: {$sum: "$lastOrderBalance"},
                        paid: {$sum: "$paid"},
                        balance: {$sum: "$balance"},
                        dataDate: {$push: "$$ROOT"}
                    }
                },
                {
                    $group: {
                        _id: null,
                        subTotal: {$sum: "$subTotal"},
                        discountAmount: {$sum: "$discountAmount"},
                        total: {$sum: "$total"},
                        lastOrderBalance: {$sum: "$lastOrderBalance"},
                        paid: {$sum: "$paid"},
                        balance: {$sum: "$balance"},
                        dataBranch: {$push: "$$ROOT"}
                    }
                }
            ])[0];

            return {rptTitle, rptHeader, rptContent};
        }
    }
});
