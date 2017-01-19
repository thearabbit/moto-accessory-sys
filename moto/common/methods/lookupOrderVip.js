import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';

// Collection
import {OrderVip} from '../collections/orderVip';

export const lookupOrderVip = new ValidatedMethod({
    name: 'moto.lookupOrderVip',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
        orderVipId: {type: String}
    }).validator(),
    run({orderVipId}) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(200);

            let data = OrderVip.aggregate([
                {
                    $match: {_id: orderVipId}
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
                        from: "moto_employee",
                        localField: "employeeId",
                        foreignField: "_id",
                        as: "employeeDoc"
                    }
                },
                {
                    $unwind: "$employeeDoc"
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
                {
                    $unwind: "$itemDoc"
                },
                {
                    $project: {
                        _id: 1,
                        orderDate: 1,
                        customerId: 1,
                        employeeId: 1,
                        customerDoc: 1,
                        employeeDoc: 1,
                        des: 1,
                        branchId: 1,
                        subTotal: 1,
                        discountAmount: 1,
                        total: 1,
                        lastOrderBalanceKhr: 1,
                        balanceKhr: 1,
                        subTotalUsd: 1,
                        discountAmountUsd: 1,
                        totalUsd: 1,
                        lastOrderBalanceUsd: 1,
                        balanceUsd: 1,
                        subTotalThb: 1,
                        discountAmountThb: 1,
                        totalThb: 1,
                        lastOrderBalanceThb: 1,
                        balanceThb: 1,
                        items: 1,
                        itemDoc: 1,
                        itemName: "$itemDoc.name",
                        type: 1,
                        discountType: 1,
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
                        closedDate: 1,
                        printId: 1
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        orderDate: {$last: "$orderDate"},
                        customerId: {$last: "$customerId"},
                        employeeId: {$last: "$employeeId"},
                        customerDoc: {$last: "$customerDoc"},
                        employeeDoc: {$last: "$employeeDoc"},
                        des: {$last: "$des"},
                        branchId: {$last: "$branchId"},
                        subTotal: {$last: "$subTotal"},
                        discountAmount: {$last: "$discountAmount"},
                        total: {$last: "$total"},
                        lastOrderBalanceKhr: {$last: "$lastOrderBalanceKhr"},
                        balanceKhr: {$last: "$balanceKhr"},
                        subTotalUsd: {$last: "$subTotalUsd"},
                        discountAmountUsd: {$last: "$discountAmountUsd"},
                        totalUsd: {$last: "$totalUsd"},
                        lastOrderBalanceUsd: {$last: "$lastOrderBalanceUsd"},
                        balanceUsd: {$last: "$balanceUsd"},
                        subTotalThb: {$last: "$subTotalThb"},
                        discountAmountThb: {$last: "$discountAmountThb"},
                        totalThb: {$last: "$totalThb"},
                        lastOrderBalanceThb: {$last: "$lastOrderBalanceThb"},
                        balanceThb: {$last: "$balanceThb"},
                        type: {$last: "$type"},
                        discountType: {$last: "$discountType"},
                        items: {
                            $addToSet: {
                                _id: "$items._id",
                                date:"$items.date",
                                itemId: "$items.itemId",
                                itemName: "$itemName",
                                currencyId: "$items.currencyId",
                                itemCurrency: "$itemCurrency",
                                qty: "$items.qty",
                                unit: "$items.unit",
                                price: "$items.price",
                                purchasePrice: "$items.purchasePrice",
                                khrPrice: "$items.khrPrice",
                                orderPrice: "$items.orderPrice",
                                discount: "$items.discount",
                                discountType: "$items.discountType",
                                amount: "$items.amount",
                                totalAmount: "$items.totalAmount",
                                memo: "$items.memo"
                            }
                        },
                        closedDate: {$last: "$closedDate"},
                        printId: {$last: "$printId"}
                    }
                }
            ]);

            return data[0];
        }
    }
});