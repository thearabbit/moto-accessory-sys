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

export const customerLogReport = new ValidatedMethod({
    name: 'moto.customerLogReport',
    mixins: [CallPromiseMixin],
    validate: null,
    run(params) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(100);

            let rptTitle, rptHeader, rptContent, rptFooter;

            let fDate = moment(params.repDate[0]).startOf('day').toDate();
            let tDate = moment(params.repDate[1]).endOf('day').toDate();

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
            let selector = {
                branchId: {$in: params.branchId},
                orderDate: {$gte: fDate, $lte: tDate},
            };

            if (!_.isUndefined(params.customerId)) selector.customerId = params.customerId;

            rptContent = Order.aggregate([
                {
                    $match: selector
                },
                // {
                //     $lookup: {
                //         from: "moto_customer",
                //         localField: "customerId",
                //         foreignField: "_id",
                //         as: "customerDoc"
                //     }
                // },
                // {
                //     $unwind: "$customerDoc"
                // },
                // {
                //     $lookup: {
                //         from: "core_branch",
                //         localField: "branchId",
                //         foreignField: "_id",
                //         as: "branchDoc"
                //     }
                // },
                // {
                //     $unwind: "$branchDoc"
                // },
                // {
                //     $lookup: {
                //         from: "moto_orderPayment",
                //         localField: "_id",
                //         foreignField: "orderId",
                //         as: "orderPaymentDoc"
                //     }
                // },
                // {
                //     $unwind: { path: "$orderPaymentDoc", preserveNullAndEmptyArrays: true }
                // },
                // {
                //     $group: {
                //         _id: "$_id",
                //         orderDate: { $last: "$orderDate" },
                //         branchId: { $last: "$branchId" },
                //         branchDoc: { $last: "$branchDoc" },
                //         employeeId: { $last: "$employeeId" },
                //         customerId: { $last: "$customerId" },
                //         customerDoc: { $last: "$customerDoc" },
                //         type: { $last: "$type" },
                //         items: { $last: "$items" },
                //         subTotal: { $last: "$subTotal" },
                //         discountAmount: { $last: "$discountAmount" },
                //         total: { $last: "$total" },
                //         lastOrderBalance: { $last: "$lastOrderBalance" },
                //         realTotal: { $last: "$balance" },
                //         paid: {
                //             $sum: {
                //                 $cond: [{
                //                     $and: [{ $ne: ["$orderPaymentDoc", null] },
                //                         { $eq: ["$orderPaymentDoc.status", "Partial"] }
                //                     ]
                //                 },
                //                     "$orderPaymentDoc.paidAmount",
                //                     0]
                //             }
                //         },
                //         orderPaymentDoc: { $push: "$orderPaymentDoc" }
                //     }
                // },
                // { $sort: { _id: -1 } },
                // {
                //     $project: {
                //         _id: 1,
                //         orderDate: 1,
                //         branchId: 1,
                //         branchDoc: 1,
                //         employeeId: 1,
                //         customerId: 1,
                //         customerDoc: 1,
                //         type: 1,
                //         items: 1,
                //         subTotal: 1,
                //         discountAmount: 1,
                //         total: 1,
                //         lastOrderBalance: 1,
                //         realTotal: 1,
                //         paid: 1,
                //         orderPaymentDoc: 1,
                //         balance: {
                //             $subtract: ["$realTotal", "$paid"]
                //         }
                //     }
                // },
                // {
                //     $group: {
                //         _id: {
                //             branchId: "$branchId"
                //         },
                //         branchDoc: { $first: "$branchDoc" },
                //         subTotal: { $first: "$subTotal" },
                //         discountAmount: { $first: "$discountAmount" },
                //         total: { $first: "$total" },
                //         lastOrderBalance: { $first: "$lastOrderBalance" },
                //         paid: { $first: "$paid" },
                //         balance: { $first: "$balance" },
                //         dataOrder: {$push: "$$ROOT" }
                //     }
                // },
                // {
                //     $project: {
                //         _id: 0,
                //         branchId: "$_id.branchId",
                //         branchDoc: 1,
                //         orderDate: 1,
                //         subTotal: 1,
                //         discountAmount: 1,
                //         total: 1,
                //         lastOrderBalance: 1,
                //         paid: 1,
                //         balance: 1,
                //         dataOrder: 1
                //     }
                // },
                // {
                //     $group: {
                //         _id: "$branchId",
                //         branchDoc: {$last: "$branchDoc"},
                //         subTotal: {$sum: "$subTotal"},
                //         discountAmount: {$sum: "$discountAmount"},
                //         total: {$sum: "$total"},
                //         lastOrderBalance: {$sum: "$lastOrderBalance"},
                //         paid: {$sum: "$paid"},
                //         balance: {$sum: "$balance"},
                //         dataOrder: {$last: "$dataOrder"}
                //     }
                // },
                // {
                //     $group: {
                //         _id: null,
                //         subTotal: {$sum: "$subTotal"},
                //         discountAmount: {$sum: "$discountAmount"},
                //         total: {$sum: "$total"},
                //         lastOrderBalance: {$sum: "$lastOrderBalance"},
                //         paid: {$sum: "$paid"},
                //         balance: {$sum: "$balance"},
                //         dataBranch: {$push: "$$ROOT"}
                //     }
                // }

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
                {
                    $lookup: {
                        from: "moto_orderPayment",
                        localField: "_id",
                        foreignField: "orderId",
                        as: "orderPaymentDoc"
                    }
                },
                {
                    $unwind: { path: "$orderPaymentDoc", preserveNullAndEmptyArrays: true }
                },
                {
                    $group: {
                        _id: "$_id",
                        orderDate: { $last: "$orderDate" },
                        branchId: { $last: "$branchId" },
                        branchDoc: { $last: "$branchDoc" },
                        employeeId: { $last: "$employeeId" },
                        customerId: { $last: "$customerId" },
                        customerDoc: { $last: "$customerDoc" },
                        type: { $last: "$type" },
                        items: { $last: "$items" },
                        subTotal: { $last: "$subTotal" },
                        discountAmount: { $last: "$discountAmount" },
                        total: { $last: "$total" },
                        lastOrderBalance: { $last: "$lastOrderBalance" },
                        realTotal: { $last: "$balance" },
                        paid: {
                            $sum: {
                                $cond: [{
                                    $and: [{ $ne: ["$orderPaymentDoc", null] },
                                        { $eq: ["$orderPaymentDoc.status", "Partial"] }
                                    ]
                                },
                                    "$orderPaymentDoc.paidAmount",
                                    0]
                            }
                        },
                        orderPaymentDoc: { $push: "$orderPaymentDoc" }
                    }
                },
                {
                    $unwind: { path: "$items", preserveNullAndEmptyArrays: true }
                },
                {
                    $lookup: {
                        from: "moto_item",
                        localField: "items.itemId",
                        foreignField: "_id",
                        as: "itemDoc"
                    }
                },
                {
                    $unwind: { path: "$itemDoc", preserveNullAndEmptyArrays: true }
                },
                {
                    $group: {
                        _id: "$_id",
                        orderDate: { $last: "$orderDate" },
                        branchId: { $last: "$branchId" },
                        branchDoc: { $last: "$branchDoc" },
                        employeeId: { $last: "$employeeId" },
                        customerId: { $last: "$customerId" },
                        customerDoc: { $last: "$customerDoc" },
                        type: { $last: "$type" },
                        items: {
                            $push: {
                                _id: "$items._id",
                                itemId: "$items.itemId",
                                itemName: "$itemDoc.name",

                                orderIndex: "$items.orderIndex",

                                secretCode: "$items.secretCode",
                                qty: "$items.qty",
                                unit: "$items.unit",
                                currencyId: "$items.currencyId",
                                price: "$items.price",
                                purchasePrice: "$items.purchasePrice",
                                khrPrice: "$items.khrPrcie",
                                orderPrice: "$items.orderPrice",
                                discount: "$items.discount",
                                discountType: "$items.discountType",
                                amount: "$items.amount",
                                totalAmount: "$items.totalAmount"
                            }

                        },
                        subTotal: { $last: "$subTotal" },
                        discountAmount: { $last: "$discountAmount" },
                        total: { $last: "$total" },
                        lastOrderBalance: { $last: "$lastOrderBalance" },
                        realTotal: { $last: "$realTotal" },
                        paid: {
                            $last: "$paid"
                        },
                        orderPaymentDoc: { $last: "$orderPaymentDoc" }
                    }
                },
                { $sort: { _id: -1 } },
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
                        lastOrderBalance: 1,
                        realTotal: 1,
                        paid: 1,
                        orderPaymentDoc: 1,
                        balance: {
                            $subtract: ["$realTotal", "$paid"]
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            branchId: "$branchId"
                        },
                        branchDoc: { $first: "$branchDoc" },
                        subTotal: { $first: "$subTotal" },
                        discountAmount: { $first: "$discountAmount" },
                        total: { $first: "$total" },
                        lastOrderBalance: { $first: "$lastOrderBalance" },
                        paid: { $first: "$paid" },
                        balance: { $first: "$balance" },
                        dataOrder: { $push: "$$ROOT" }
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
                        branchDoc: { $last: "$branchDoc" },
                        subTotal: { $sum: "$subTotal" },
                        discountAmount: { $sum: "$discountAmount" },
                        total: { $sum: "$total" },
                        lastOrderBalance: { $sum: "$lastOrderBalance" },
                        paid: { $sum: "$paid" },
                        balance: { $sum: "$balance" },
                        dataOrder: { $last: "$dataOrder" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        subTotal: { $sum: "$subTotal" },
                        discountAmount: { $sum: "$discountAmount" },
                        total: { $sum: "$total" },
                        lastOrderBalance: { $sum: "$lastOrderBalance" },
                        paid: { $sum: "$paid" },
                        balance: { $sum: "$balance" },
                        dataBranch: { $push: "$$ROOT" }
                    }
                }
            ])[0];

            return {rptTitle, rptHeader, rptContent};
        }
    }
});
