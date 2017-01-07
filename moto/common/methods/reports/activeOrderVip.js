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
import {OrderVip} from '../../collections/orderVip';

export const activeOrderVipReport = new ValidatedMethod({
    name: 'moto.activeOrderVipReport',
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

            rptContent = OrderVip.aggregate([
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
                        from: "moto_orderVipPayment",
                        localField: "_id",
                        foreignField: "orderVipId",
                        as: "orderVipPaymentDoc"
                    }
                },

                {
                    $unwind: {path: "$orderVipPaymentDoc", preserveNullAndEmptyArrays: true}
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
                        lastOrderBalanceKhr: {$last: "$lastOrderBalanceKhr"},
                        orderBalanceKhr: {$last: "$balanceKhr"},
                        paid: {
                            $sum: {
                                $cond: [{
                                    $and: [{$ne: ["$orderVipPaymentDoc", null]},
                                        {$eq: ["$orderVipPaymentDoc.status", "Partial"]}
                                    ]
                                },
                                    "$orderVipPaymentDoc.paidAmountKhr",
                                    0]
                            }
                        },
                        subTotalUsd: {$last: "$subTotalUsd"},
                        discountAmountUsd: {$last: "$discountAmountUsd"},
                        totalUsd: {$last: "$totalUsd"},
                        lastOrderBalanceUsd: {$last: "$lastOrderBalanceUsd"},
                        orderBalanceUsd: {$last: "$balanceUsd"},
                        paidUsd: {
                            $sum: {
                                $cond: [{
                                    $and: [{$ne: ["$orderVipPaymentDoc", null]},
                                        {$eq: ["$orderVipPaymentDoc.status", "Partial"]}
                                    ]
                                },
                                    "$orderVipPaymentDoc.paidAmountUsd",
                                    0]
                            }
                        },
                        subTotalThb: {$last: "$subTotalThb"},
                        discountAmountThb: {$last: "$discountAmountThb"},
                        totalThb: {$last: "$totalThb"},
                        lastOrderBalanceThb: {$last: "$lastOrderBalanceThb"},
                        orderBalanceThb: {$last: "$balanceThb"},
                        paidThb: {
                            $sum: {
                                $cond: [{
                                    $and: [{$ne: ["$orderVipPaymentDoc", null]},
                                        {$eq: ["$orderVipPaymentDoc.status", "Partial"]}
                                    ]
                                },
                                    "$orderVipPaymentDoc.paidAmountThb",
                                    0]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        orderDate: 1,
                        branchId: 1,
                        branchDoc: 1,
                        employeeId: 1,
                        customerId: 1,
                        customerDoc: 1,
                        type: 1,
                        items: 1,
                        subTotal: 1,
                        discountAmount: 1,
                        total: 1,
                        paid: 1,
                        lastOrderBalanceKhr: 1,
                        orderBalanceKhr: 1,
                        balance: {$subtract: ["$orderBalanceKhr", "$paid"]},
                        subTotalUsd: 1,
                        discountAmountUsd: 1,
                        totalUsd: 1,
                        paidUsd: 1,
                        lastOrderBalanceUsd: 1,
                        orderBalanceUsd: 1,
                        balanceUsd: {$subtract: ["$orderBalanceUsd", "$paidUsd"]},
                        subTotalThb: 1,
                        discountAmountThb: 1,
                        totalThb: 1,
                        paidThb: 1,
                        lastOrderBalanceThb: 1,
                        orderBalanceThb: 1,
                        balanceThb: {$subtract: ["$orderBalanceThb", "$paidThb"]},
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
                        lastOrderBalanceKhr: {$sum: "$lastOrderBalanceKhr"},
                        paid: {$sum: "$paid"},
                        balance: {$sum: "$balance"},
                        subTotalUsd: {$sum: "$subTotalUsd"},
                        discountAmountUsd: {$sum: "$discountAmountUsd"},
                        totalUsd: {$sum: "$totalUsd"},
                        lastOrderBalanceUsd: {$sum: "$lastOrderBalanceUsd"},
                        paidUsd: {$sum: "$paidUsd"},
                        balanceUsd: {$sum: "$balanceUsd"},
                        subTotalThb: {$sum: "$subTotalThb"},
                        discountAmountThb: {$sum: "$discountAmountThb"},
                        totalThb: {$sum: "$totalThb"},
                        lastOrderBalanceThb: {$sum: "$lastOrderBalanceThb"},
                        paidThb: {$sum: "$paidThb"},
                        balanceThb: {$sum: "$balanceThb"},
                        dataOrderVip: {$push: "$$ROOT"}
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
                        lastOrderBalanceKhr: 1,
                        paid: 1,
                        balance: 1,
                        subTotalUsd: 1,
                        discountAmountUsd: 1,
                        totalUsd: 1,
                        lastOrderBalanceUsd: 1,
                        paidUsd: 1,
                        balanceUsd: 1,
                        subTotalThb: 1,
                        discountAmountThb: 1,
                        totalThb: 1,
                        lastOrderBalanceThb: 1,
                        paidThb: 1,
                        balanceThb: 1,
                        dataOrderVip: 1
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
                        lastOrderBalanceKhr: {$sum: "$lastOrderBalanceKhr"},
                        paid: {$sum: "$paid"},
                        balance: {$sum: "$balance"},
                        subTotalUsd: {$sum: "$subTotalUsd"},
                        discountAmountUsd: {$sum: "$discountAmountUsd"},
                        totalUsd: {$sum: "$totalUsd"},
                        lastOrderBalanceUsd: {$sum: "$lastOrderBalanceUsd"},
                        paidUsd: {$sum: "$paidUsd"},
                        balanceUsd: {$sum: "$balanceUsd"},
                        subTotalThb: {$sum: "$subTotalThb"},
                        discountAmountThb: {$sum: "$discountAmountThb"},
                        totalThb: {$sum: "$totalThb"},
                        lastOrderBalanceThb: {$sum: "$lastOrderBalanceThb"},
                        paidThb: {$sum: "$paidThb"},
                        balanceThb: {$sum: "$balanceThb"},
                        dataVipDate: {$push: "$$ROOT"}
                    }
                },
                {
                    $group: {
                        _id: null,
                        subTotal: {$sum: "$subTotal"},
                        discountAmount: {$sum: "$discountAmount"},
                        total: {$sum: "$total"},
                        lastOrderBalanceKhr: {$sum: "$lastOrderBalanceKhr"},
                        paid: {$sum: "$paid"},
                        balance: {$sum: "$balance"},
                        subTotalUsd: {$sum: "$subTotalUsd"},
                        discountAmountUsd: {$sum: "$discountAmountUsd"},
                        totalUsd: {$sum: "$totalUsd"},
                        lastOrderBalanceUsd: {$sum: "$lastOrderBalanceUsd"},
                        paidUsd: {$sum: "$paidUsd"},
                        balanceUsd: {$sum: "$balanceUsd"},
                        subTotalThb: {$sum: "$subTotalThb"},
                        discountAmountThb: {$sum: "$discountAmountThb"},
                        totalThb: {$sum: "$totalThb"},
                        lastOrderBalanceThb: {$sum: "$lastOrderBalanceThb"},
                        paidThb: {$sum: "$paidThb"},
                        balanceThb: {$sum: "$balanceThb"},
                        dataVipBranch: {$push: "$$ROOT"}
                    }
                }
            ])[0];

            return {rptTitle, rptHeader, rptContent};
        }
    }
});
