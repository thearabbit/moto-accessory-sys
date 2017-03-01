import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {Order} from '../../common/collections/order.js';
import {OrderPayment} from '../../common/collections/orderPayment.js';

Order.before.insert(function (userId, doc) {
    let prefix = `${doc.branchId}-`;
    doc.printId = doc._id;
    doc._id = idGenerator.genWithPrefix(Order, prefix, 12);
    doc.balance = doc.total + doc.lastOrderBalance;
});

Order.after.update(function (userId, doc) {

    if (doc.discountAmount == null) {
        doc.discountAmount = 0;
    }

    let balance = doc.total + doc.lastOrderBalance;
    Order.direct.update({_id: doc._id}, {$set: {balance: balance}});
});

Order.after.remove(function (userId, doc) {
    OrderPayment.remove({orderId: doc._id});
});
