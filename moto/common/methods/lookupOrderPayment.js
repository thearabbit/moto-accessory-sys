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
        orderId: {type: String}
    }).validator(),
    run({orderId}) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(200);

            let data = Order.aggregate([
                {
                    $match: {_id: orderId}
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
                        total: 1,
                        paymentCount: { $size: '$paymentDoc' }
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
                {
                    $project: {
                        _id: 1,
                        customerId: 1,
                        orderDate: 1,
                        paymentDoc: {
                            $cond: [
                                { $ne: ["$paymentCount", 0] }, '$paymentDoc', '$$ROOT'
                            ]
                        }
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
                        customerId: { $last: '$customerId' },
                        payment: {
                            $last: '$paymentDoc'
                        }
                    }
                }
            ]);

            return data[0];
        }
    }
});