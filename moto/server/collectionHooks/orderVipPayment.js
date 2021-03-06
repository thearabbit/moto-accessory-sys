import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {OrderVipPayment} from '../../common/collections/orderVipPayment.js';
import {OrderVip} from '../../common/collections/orderVip.js';

OrderVipPayment.before.insert(function (userId, doc) {
    let prefix = `${doc.branchId}-`;
    doc._id = idGenerator.genWithPrefix(OrderVipPayment, prefix, 12);

    if (doc.paymentBalanceKhr == 0 && doc.paymentBalanceUsd == 0 && doc.paymentBalanceThb == 0) {
        doc.status = "Closed";
        OrderVip.direct.update({customerId: doc.customerId}, {$set: {closedDate: doc.paidDate}}, {multi: true});
    } else if (doc.paymentBalanceKhr < 0 && doc.paymentBalanceUsd < 0 && doc.paymentBalanceThb < 0) {
        doc.status = "Overpaid"
    }
    else {
        doc.status = "Partial";
    }
    OrderVip.direct.update(doc.orderVipId, {$set: {status: doc.status}});
});

OrderVipPayment.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    if (modifier.$set.paymentBalanceKhr == 0 && modifier.$set.paymentBalanceUsd == 0 && modifier.$set.paymentBalanceThb == 0) {
        modifier.$set.status = "Closed";
        OrderVip.direct.update({customerId: modifier.$set.customerId}, {$set: {closedDate: modifier.$set.paidDate}}, {multi: true});
    } else if (modifier.$set.paymentBalanceKhr < 0 || modifier.$set.paymentBalanceUsd < 0 || modifier.$set.paymentBalanceThb < 0) {
        modifier.$set.status = "Overpaid"
        OrderVip.direct.update({customerId: modifier.$set.customerId}, {$set: {closedDate: ""}}, {multi: true});
    }
    else {
        modifier.$set.status = "Partial";
        OrderVip.direct.update({customerId: modifier.$set.customerId}, {$set: {closedDate: ""}}, {multi: true});
    }
    OrderVip.direct.update(modifier.$set.orderVipId, {$set: {status: modifier.$set.status}});
});

OrderVipPayment.after.remove(function (userId, doc) {
    let lastOrderVipPaymentDoc = OrderVipPayment.findOne({orderVipId: doc.orderVipId}, {sort: {paidDate: 1}});

    if (lastOrderVipPaymentDoc) {
        OrderVip.direct.update(lastOrderVipPaymentDoc.orderVipId, {$set: {status: lastOrderVipPaymentDoc.status}});
    }

    OrderVip.direct.update(doc.orderVipId, {$set: {status: "Partial"}});
    OrderVip.direct.update({customerId: doc.customerId}, {$set: {closedDate: ""}}, {multi: true});
});
