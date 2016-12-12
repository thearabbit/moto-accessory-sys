import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';

// Collection
import {OrderVip} from '../collections/orderVip';

export const lookupOrderVipLog = new ValidatedMethod({
    name: 'moto.lookupOrderVipLog',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
        customerId: {type: String}
    }).validator(),
    run({customerId}) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(200);

            let data = OrderVip.aggregate([
                {
                    $match: {customerId: customerId}
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
                    $unwind: {
                        path: '$customerDoc', preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "moto_orderVipPayment",
                        localField: "_id",
                        foreignField: "orderVipId",
                        as: "paymentVipDoc"
                    }
                },
                {
                    $unwind: {
                        path: '$paymentVipDoc', preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $group: {
                        _id: "$_id",
                        customerId: { $last: "$customerId" },
                        customerDoc: { $last: "$customerDoc" },
                        orderVipDate: {$last: "$orderDate"},
                        totalKhr: { $last: "$total" },
                        balanceKhr: { $last: "$paymentVipDoc.balanceKhr" },
                        totalUsd: { $last: "$totalUsd" },
                        balanceUsd: { $last: "$paymentVipDoc.balanceUsd" },
                        totalThb: { $last: "$totalThb" },
                        balanceThb: { $last: "$paymentVipDoc.balanceThb" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        customerId: 1,
                        customerDoc: 1,
                        orderVipDate:1,
                        totalKhr: 1,
                        balanceKhr: 1,
                        totalUsd: 1,
                        balanceUsd: 1,
                        totalThb: 1,
                        balanceThb: 1
                    }

                },
                {
                    $group: {
                        _id: "$customerId",
                        customerId: { $last: "$customerId" },
                        customerDoc: { $last: "$customerDoc" },
                        orderVipLog: {
                            $addToSet: {
                                oldOrderVipRefId: "$_id",
                                oldOrderVipDate:"$orderVipDate",
                                oldOrderVipTotalKhr: {
                                    $cond: [
                                        { $eq: ["$balanceKhr", null] }, "$totalKhr", "$balanceKhr"
                                    ]
                                },
                                oldOrderVipTotalUsd: {
                                    $cond: [
                                        { $eq: ["$balanceUsd", null] }, "$totalUsd", "$balanceUsd"
                                    ]
                                },
                                oldOrderVipTotalThb: {
                                    $cond: [
                                        { $eq: ["$balanceThb", null] }, "$totalThb", "$balanceThb"
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: {
                        path: '$orderVipLog', preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: "$customerId",
                        customerId: { $last: "$customerId" },
                        customerDoc: { $last: "$customerDoc" },
                        orderVipLog: {
                            $addToSet: "$orderVipLog"
                        },
                        totalOrderVipLogKhr: { $sum: "$orderVipLog.oldOrderVipTotalKhr" },
                        totalOrderVipLogUsd: { $sum: "$orderVipLog.oldOrderVipTotalUsd" },
                        totalOrderVipLogThb: { $sum: "$orderVipLog.oldOrderVipTotalThb" }
                    }
                }
            ]);

            return data[0];
        }
    }
});