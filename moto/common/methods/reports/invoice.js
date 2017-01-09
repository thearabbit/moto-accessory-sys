import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/common/collections/company.js';
import {Order} from '../../collections/order.js';

export const invoiceReport = new ValidatedMethod({
    name: 'moto.invoiceReport',
    mixins: [CallPromiseMixin],
    validate: null,
    // validate: new SimpleSchema({
    // orderId: {type: String}
    // }).validator(),
    run({orderId, printId}) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(200);
            console.log(orderId);
            console.log(printId);
            let rptTitle, rptContent, rptFooter;

            // --- Title ---
            rptTitle = Company.findOne();

            // --- Content ---
            rptContent = Order.aggregate([
                {
                    $match: {$or: [{_id: orderId}, {printId: printId}]}
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
                    $unwind: "$items"
                },
                {
                    $lookup: {
                        from: "moto_item",
                        localField: "items.itemId",
                        foreignField: "_id",
                        as: "itemDoc"
                    }
                },
                {$unwind: {path: '$itemDoc', preserveNullAndEmptyArrays: true}},
                {
                    $group: {
                        _id: "$_id",
                        customerId: {$last: "$customerId"},
                        customerDoc: {$last: "$customerDoc"},
                        orderDate: {$last: "$orderDate"},
                        des: {$last: "$des"},
                        branchId: {$last: "$branchId"},
                        total: {$last: "$total"},
                        lastOrderBalance: {$last: "$lastOrderBalance"},
                        balance: {$last: "$balance"},
                        items: {
                            $addToSet: {
                                _id: "$items._id",
                                itemId: "$items.itemId",
                                itemName: "$itemDoc.name",
                                memoItem: "$items.memoItem",
                                qty: "$items.qty",
                                unit: "$items.unit",
                                orderPrice: "$items.orderPrice",
                                discount: "$items.discount",
                                discountType: "$items.discountType",
                                totalAmount: "$items.totalAmount",
                                memo: "$items.memo"
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "moto_orderPayment",
                        localField: "_id",
                        foreignField: "orderId",
                        as: "orderPaymentDoc"
                    }
                },
                {$unwind: {path: '$orderPaymentDoc', preserveNullAndEmptyArrays: true}},
                {
                    $group: {
                        _id: "$_id",
                        customerId: {$last: "$customerId"},
                        customerDoc: {$last: "$customerDoc"},
                        orderDate: {$last: "$orderDate"},
                        des: {$last: "$des"},
                        branchId: {$last: "$branchId"},
                        items: {$last: "$items"},
                        total: {$last: "$total"},
                        lastOrderBalance: {$last: "$lastOrderBalance"},
                        balance: {$last: "$balance"},
                        totalPaidAmount: {$sum: "$orderPaymentDoc.paidAmount"}
                    }
                },
                {
                    $project: {
                        _id: 1,
                        customerId: 1,
                        customerDoc: 1,
                        orderDate: 1,
                        des: 1,
                        branchId: 1,
                        items: 1,
                        total: 1,
                        lastOrderBalance: 1,
                        balance: 1,
                        totalPaidAmount: 1,
                        overDue: {$subtract: ["$balance", "$totalPaidAmount"]}
                    }
                }
            ])[0];

            return {rptTitle, rptContent};
        }
    }
});
