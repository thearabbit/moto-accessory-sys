import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {OrderPayment} from '../../common/collections/orderPayment.js';
import {Order} from '../../common/collections/order.js';

OrderPayment.before.insert(function (userId, doc) {
    let prefix = `${doc.branchId}-`;
    doc._id = idGenerator.genWithPrefix(OrderPayment, prefix, 12);

    if (doc.balance == 0) {
        doc.status = "Closed";
        Order.direct.update(doc.orderId, {$set: {closedDate: doc.paidDate}});
    }
    else if (doc.balance < 0) {
        doc.status = "Overpaid"
    }
    else {
        doc.status = "Partial";
    }

    Order.direct.update(doc.orderId, {$set: {status: doc.status}});
});

OrderPayment.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};

    if (modifier.$set.balance == 0) {
        modifier.$set.status = "Closed";
        Order.direct.update(modifier.$set.orderId, {$set: {closedDate: modifier.$set.paidDate}});
    } else if (modifier.$set.balance < 0) {
        modifier.$set.status = "Overpaid"
    }
    else {
        modifier.$set.status = "Partial";
    }

    Order.direct.update(modifier.$set.orderId, {$set: {status: modifier.$set.status}});
});

OrderPayment.after.remove(function (userId, doc) {
    let lastOrderPaymentDoc = OrderPayment.findOne({orderId: doc.orderId}, {sort: {paidDate: 1}});

    if (lastOrderPaymentDoc) {
        Order.direct.update(lastOrderPaymentDoc.orderId, {$set: {status: lastOrderPaymentDoc.status}});
    }

    Order.direct.update(doc.orderId, {$set: {status: "Partial"}});
    Order.direct.update(doc.orderId, {$set: {closedDate: ""}});
});
