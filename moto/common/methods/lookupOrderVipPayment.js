import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';

// Collection
import {OrderVip} from '../collections/orderVip';

export const lookupOrderVipPayment = new ValidatedMethod({
    name: 'moto.lookupOrderVipPayment',
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
                        from: "moto_orderVipPayment",
                        localField: "_id",
                        foreignField: "orderVipId",
                        as: "paymentVipDoc"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        branchId: 1,
                        customerId: 1,
                        orderDate: 1,
                        paymentVipDoc: 1,
                        balanceKhr: 1,
                        balanceUsd: 1,
                        balanceThb: 1,
                        paymentVipCount: {$size: '$paymentVipDoc'},
                        printId: 1
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
                        paymentVipDoc: {
                            $cond: [
                                {$ne: ["$paymentVipCount", 0]}, '$paymentVipDoc', '$$ROOT'
                            ]
                        },
                        printId: 1
                    }
                },
                {
                    $unwind: {
                        path: '$paymentVipDoc', preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        customerId: {$last: '$customerId'},
                        paymentVip: {
                            $last: '$paymentVipDoc'
                        },
                        printId: {$last: '$printId'}
                    }
                }
            ]);

            return data[0];
        }
    }
});