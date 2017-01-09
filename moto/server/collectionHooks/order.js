import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {Order} from '../../common/collections/order.js';
import {OrderPayment} from '../../common/collections/orderPayment.js';

Order.before.insert(function (userId, doc) {
    let prefix = `${doc.branchId}-`;
    doc.printId =  doc._id;
    doc._id = idGenerator.genWithPrefix(Order, prefix, 12);
    doc.balance = doc.total + doc.lastOrderBalance;
});

Order.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};

    if (modifier.$set.discountAmount == null) {
        modifier.$set.discountAmount = 0;
    }

    modifier.$set.balance = modifier.$set.total + modifier.$set.lastOrderBalance;
});

Order.after.remove(function (userId, doc) {
    OrderPayment.remove({orderId: doc._id});
});
