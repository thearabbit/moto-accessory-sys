import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {OrderVip} from '../../common/collections/orderVip.js';

OrderVip.before.insert(function (userId, doc) {
    let prefix = `${doc.branchId}-`;
    doc._id = idGenerator.genWithPrefix(OrderVip, prefix, 12);
});

OrderVip.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};

    if (modifier.$set.discountAmount == null) {
        modifier.$set.discountAmount = 0;
    } else if (modifier.$set.discountAmountUsd == null) {
        modifier.$set.discountAmountUsd = 0;
    } else if (modifier.$set.discountAmountThb == null) {
        modifier.$set.discountAmountThb = 0;
    }
});