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
                        customerId: {$last: "$customerId"},
                        customerDoc: {$last: "$customerDoc"},
                        orderDate: {$last: "$orderDate"},
                        total: {$last: "$total"},
                        balanceKhr: {$last: "$balanceKhr"},
                        paymentBalanceKhr: {$last: "$paymentVipDoc.paymentBalanceKhr"},
                        balanceUsd: {$last: "$balanceUsd"},
                        paymentBalanceUsd: {$last: "$paymentVipDoc.paymentBalanceUsd"},
                        balanceThb: {$last: "$balanceThb"},
                        paymentBalanceThb: {$last: "$paymentVipDoc.paymentBalanceThb"},
                        des: {$last: "$des"}
                    }
                },
                {
                    $project: {
                        _id: 1,
                        customerId: 1,
                        customerDoc: 1,
                        orderDate: 1,
                        total: 1,
                        balanceKhr: 1,
                        paymentBalanceKhr: 1,
                        balanceUsd: 1,
                        paymentBalanceUsd: 1,
                        balanceThb: 1,
                        paymentBalanceThb: 1,
                        des: 1
                    }
                },
                {
                    $group: {
                        _id: "$customerId",
                        customerId: {$last: "$customerId"},
                        customerDoc: {$last: "$customerDoc"},
                        orderVipLog: {
                            $addToSet: {
                                oldOrderVipRefId: "$_id",
                                oldOrderVipDate: "$orderDate",
                                oldOrderVipTotalKhr: {
                                    $cond: [
                                        {$eq: ["$paymentBalanceKhr", null]}, "$balanceKhr", "$paymentBalanceKhr"
                                    ]
                                },
                                oldOrderVipTotalUsd: {
                                    $cond: [
                                        {$eq: ["$paymentBalanceUsd", null]}, "$balanceUsd", "$paymentBalanceUsd"
                                    ]
                                },
                                oldOrderVipTotalThb: {
                                    $cond: [
                                        {$eq: ["$paymentBalanceThb", null]}, "$balanceThb", "$paymentBalanceThb"
                                    ]
                                },
                                des: "$des"
                            }
                        }
                    }
                },
                {
                    $unwind: {
                        path: '$orderVipLog', preserveNullAndEmptyArrays: true
                    }
                },
                {$sort: {_id : 1}},
                {
                    $project: {
                        _id: 1,
                        customerId: 1,
                        customerDoc: 1,
                        orderVipLog: 1,
                        des: 1,
                        totalOrderVipLogKhr: {
                            $cond: {
                                if: {$lte: ["$orderVipLog.oldOrderVipTotalKhr", 0]},
                                then: "$orderVipLog.oldOrderVipTotalKhr",
                                else: {
                                    $sum: "$orderVipLog.oldOrderVipTotalKhr"

                                }
                            }
                        },
                        totalOrderVipLogUsd: {
                            $cond: {
                                if: {$lte: ["$orderVipLog.oldOrderVipTotalUsd", 0]},
                                then: "$orderVipLog.oldOrderVipTotalUsd",
                                else: {
                                    $sum: "$orderVipLog.oldOrderVipTotalUsd"

                                }
                            }
                        },
                        totalOrderVipLogThb: {
                            $cond: {
                                if: {$lte: ["$orderVipLog.oldOrderVipTotalThb", 0]},
                                then: "$orderVipLog.oldOrderVipTotalThb",
                                else: {
                                    $sum: "$orderVipLog.oldOrderVipTotalThb"

                                }
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: "$customerId",
                        customerId: {$last: "$customerId"},
                        customerDoc: {$last: "$customerDoc"},
                        orderVipLog: {
                            $addToSet: "$orderVipLog"
                        },
                        totalOrderVipLogKhr: {$last: "$totalOrderVipLogKhr"},
                        totalOrderVipLogUsd: {$last: "$totalOrderVipLogUsd"},
                        totalOrderVipLogThb: {$last: "$totalOrderVipLogThb"},
                    }
                }
            ]);

            return data[0];
        }
    }
});