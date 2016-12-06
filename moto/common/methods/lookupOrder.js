import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';

// Collection
import {Order} from '../collections/order';

export const lookupOrder = new ValidatedMethod({
    name: 'moto.lookupOrder',
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
                        items: 1,
                        itemDoc: 1,
                        itemName: "$itemDoc.name",
                        type: 1,
                        discountType: 1,
                        itemDiscountType: {
                            $cond: {if: {$eq: ["$discountType", "Percentage"]}, then: "%", else: "៛"}

                        }
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
                        type: {$last: "$type"},
                        discountType: {$last: "$discountType"},
                        items: {
                            $addToSet: {
                                _id: "$items._id",
                                itemId: "$items.itemId",
                                itemName: "$itemName",
                                memoItem: "$items.memoItem",
                                currencyId: "$items.currencyId",
                                qty: "$items.qty",
                                price: "$items.price",
                                khrPrice: "$items.khrPrice",
                                orderPrice: "$items.orderPrice",
                                discount: "$items.discount",
                                discountType: "$itemDiscountType",
                                amount: "$items.amount",
                                totalAmount: "$items.totalAmount",
                                memo: "$items.memo"
                            }
                        }
                    }
                }
            ]);

            return data[0];
        }
    }
});