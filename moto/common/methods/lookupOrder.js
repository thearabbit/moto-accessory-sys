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
                {$sort: {"items.orderIndex": -1}},
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
                        exchangeId: 1,
                        customerDoc: 1,
                        employeeDoc: 1,
                        des: 1,
                        branchId: 1,
                        subTotal: 1,
                        discountAmount: 1,
                        total: 1,
                        lastOrderBalance: 1,
                        balance: 1,
                        items: 1,
                        itemDoc: 1,
                        itemName: "$itemDoc.name",
                        type: 1,
                        discountType: 1,
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
                        exchangeId: {$last: "$exchangeId"},
                        employeeDoc: {$last: "$employeeDoc"},
                        des: {$last: "$des"},
                        branchId: {$last: "$branchId"},
                        subTotal: {$last: "$subTotal"},
                        discountAmount: {$last: "$discountAmount"},
                        total: {$last: "$total"},
                        lastOrderBalance: {$last: "$lastOrderBalance"},
                        balance: {$last: "$balance"},
                        type: {$last: "$type"},
                        discountType: {$last: "$discountType"},
                        items: {
                            $push: {
                                _id: "$items._id",
                                orderIndex: "$items.orderIndex",
                                itemId: "$items.itemId",
                                itemName: "$itemName",
                                secretCode:"$items.secretCode",
                                memoItem: "$items.memoItem",
                                currencyId: "$items.currencyId",
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
                }]);

            return data[0];
        }
    }
});