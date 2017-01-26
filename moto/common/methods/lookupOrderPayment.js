import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';

// Collection
import {Order} from '../collections/order';

export const lookupOrderPayment = new ValidatedMethod({
    name: 'moto.lookupOrderPayment',
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
                        from: "moto_orderPayment",
                        localField: "_id",
                        foreignField: "orderId",
                        as: "paymentDoc"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        branchId: 1,
                        customerId: 1,
                        orderDate: 1,
                        paymentDoc: 1,
                        balance: 1,
                        paymentCount: {$size: '$paymentDoc'},
                        printId: 1,
                    }
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
                {$sort: {_id: 1}},
                {
                    $group: {
                        _id: "$customerId",
                        order: {$last: "$$ROOT"},
                    }
                },
                {
                    $project: {
                        _id: "$order._id",
                        customerId: "$_id",
                        orderDate: "$order.orderDate",
                        paymentDoc: {
                            $cond: [
                                {$ne: ["$order.paymentCount", 0]}, '$order.paymentDoc', '$order'
                            ]
                        },
                        printId: "$order.printId"
                    }
                },
                {
                    $unwind: {
                        path: '$paymentDoc', preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        customerId: {$last: '$customerId'},
                        payment: {
                            $last: '$paymentDoc'
                        },
                        printId: {$last: "$printId"}
                    }
                }
            ]);

            return data[0];
        }
    }
});