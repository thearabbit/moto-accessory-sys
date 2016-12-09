import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';

// Collection
import {Order} from '../collections/order';

export const lookupOrderLog = new ValidatedMethod({
    name: 'moto.lookupOrderLog',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
        customerId: {type: String}
    }).validator(),
    run({customerId}) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(200);

            let data = Order.aggregate([
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
                        from: "moto_orderPayment",
                        localField: "_id",
                        foreignField: "orderId",
                        as: "paymentDoc"
                    }
                },
                {
                    $unwind: {
                        path: '$paymentDoc', preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $group: {
                        _id: "$_id",
                        customerId: {$last: "$customerId"},
                        customerDoc: {$last: "$customerDoc"},
                        orderDate: {$last: "$orderDate"},
                        total: {$last: "$total"},
                        paymentBalance: {$last: "$paymentDoc.balance"},
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
                        paymentBalance: 1,
                        des: 1
                    }

                },
                {
                    $group: {
                        _id: "$customerId",
                        customerId: {$last: "$customerId"},
                        customerDoc: {$last: "$customerDoc"},
                        orderLog: {
                            $addToSet: {
                                oldOrderRefId: "$_id",
                                oldOrderDate: "$orderDate",
                                oldOrderTotal: {
                                    $cond: [
                                        {$eq: ["$paymentBalance", null]}, "$total", "$paymentBalance"
                                    ]
                                },
                                des: "$des"
                            }
                        }
                    }
                },
                {
                    $unwind: {
                        path: '$orderLog', preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: "$customerId",
                        customerId: {$last: "$customerId"},
                        customerDoc: {$last: "$customerDoc"},
                        orderLog: {
                            $addToSet: "$orderLog"
                        },
                        totalOrderLog: {$sum: "$orderLog.oldOrderTotal"}
                    }
                }
            ]);

            return data[0];
        }
    }
});