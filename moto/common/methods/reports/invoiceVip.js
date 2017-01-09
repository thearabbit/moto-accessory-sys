import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/common/collections/company.js';
import {OrderVip} from '../../collections/orderVip.js';

export const invoiceVipReport = new ValidatedMethod({
    name: 'moto.invoiceVipReport',
    mixins: [CallPromiseMixin],
    validate: null,
    // validate: new SimpleSchema({
    //     orderVipId: {type: String}
    // }).validator(),
    run({orderVipId, printId}) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(200);
            let rptTitle, rptContent, rptFooter;

            // --- Title ---
            rptTitle = Company.findOne();

            // --- Content ---
            rptContent = OrderVip.aggregate([
                {
                    $match: {$or: [{_id: orderVipId}, {printId: printId}]}
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
                        lastOrderBalanceKhr: {$last: "$lastOrderBalanceKhr"},
                        balanceKhr: {$last: "$balanceKhr"},
                        totalUsd: {$last: "$totalUsd"},
                        lastOrderBalanceUsd: {$last: "$lastOrderBalanceUsd"},
                        balanceUsd: {$last: "$balanceUsd"},
                        totalThb: {$last: "$totalThb"},
                        lastOrderBalanceThb: {$last: "$lastOrderBalanceThb"},
                        balanceThb: {$last: "$balanceThb"},
                        items: {
                            $addToSet: {
                                _id: "$items._id",
                                itemId: "$items.itemId",
                                itemName: "$itemDoc.name",
                                memoItem: "$items.memoItem",
                                currencyId: "$items.currencyId",
                                itemCurrency: {
                                    $cond: {
                                        if: {$eq: ["$itemDoc.currencyId", "KHR"]},
                                        then: "៛",
                                        else: {
                                            $cond: {
                                                if: {$eq: ["$itemDoc.currencyId", "USD"]},
                                                then: " $",
                                                else: "B"
                                            }
                                        }

                                    }

                                },
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
                        from: "moto_orderVipPayment",
                        localField: "_id",
                        foreignField: "orderVipId",
                        as: "orderVipPaymentDoc"
                    }
                },
                {$unwind: {path: '$orderVipPaymentDoc', preserveNullAndEmptyArrays: true}},
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
                        lastOrderBalanceKhr: {$last: "$lastOrderBalanceKhr"},
                        balanceKhr: {$last: "$balanceKhr"},
                        totalPaidAmountKhr: {$sum: "$orderVipPaymentDoc.paidAmountKhr"},
                        totalUsd: {$last: "$totalUsd"},
                        lastOrderBalanceUsd: {$last: "$lastOrderBalanceUsd"},
                        balanceUsd: {$last: "$balanceUsd"},
                        totalPaidAmountUsd: {$sum: "$orderVipPaymentDoc.paidAmountUsd"},
                        totalThb: {$last: "$totalThb"},
                        lastOrderBalanceThb: {$last: "$lastOrderBalanceThb"},
                        balanceThb: {$last: "$balanceThb"},
                        totalPaidAmountThb: {$sum: "$orderVipPaymentDoc.paidAmountThb"},
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
                        lastOrderBalanceKhr: 1,
                        balanceKhr: 1,
                        totalPaidAmountKhr: 1,
                        overDueKhr: {$subtract: ["$balanceKhr", "$totalPaidAmountKhr"]},
                        totalUsd: 1,
                        lastOrderBalanceUsd: 1,
                        balanceUsd: 1,
                        totalPaidAmountUsd: 1,
                        overDueUsd: {$subtract: ["$balanceUsd", "$totalPaidAmountUsd"]},
                        totalThb: 1,
                        lastOrderBalanceThb: 1,
                        balanceThb: 1,
                        totalPaidAmountThb: 1,
                        overDueThb: {$subtract: ["$balanceThb", "$totalPaidAmountThb"]}
                    }
                }
            ])[0];

            return {rptTitle, rptContent};
        }
    }
});
