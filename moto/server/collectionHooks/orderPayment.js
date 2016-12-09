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
    } else {
        doc.status = "Partial";
    }
});

OrderPayment.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};

    if (modifier.$set.balance == 0) {
        modifier.$set.status = "Closed";
    } else {
        modifier.$set.status = "Partial";
    }
});
