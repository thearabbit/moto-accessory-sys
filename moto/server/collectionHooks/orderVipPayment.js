import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {OrderVipPayment} from '../../common/collections/orderVipPayment.js';

OrderVipPayment.before.insert(function (userId, doc) {
    let prefix = `${doc.branchId}-`;
    doc._id = idGenerator.genWithPrefix(OrderVipPayment, prefix, 12);

    if (doc.balanceKhr == 0 && doc.balanceUsd == 0 && doc.balanceThb == 0) {
        doc.status = "Closed";
    } else {
        doc.status = "Partial";
    }
});

OrderVipPayment.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};

    if (modifier.$set.balanceKhr == 0 && modifier.$set.balanceUsd == 0 && modifier.$set.balanceThb == 0) {
        modifier.$set.status = "Closed";
    } else {
        modifier.$set.status = "Partial";
    }
});
