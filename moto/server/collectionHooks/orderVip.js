import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {OrderVip} from '../../common/collections/orderVip.js';
import {OrderVipPayment} from '../../common/collections/orderVipPayment.js';

OrderVip.before.insert(function (userId, doc) {
    let prefix = `${doc.branchId}-`;
    doc.printId = doc._id;
    doc._id = idGenerator.genWithPrefix(OrderVip, prefix, 12);

    doc.balanceKhr = doc.total + doc.lastOrderBalanceKhr;
    doc.balanceUsd = doc.totalUsd + doc.lastOrderBalanceUsd;
    doc.balanceThb = doc.totalThb + doc.lastOrderBalanceThb;
});

// OrderVip.before.update(function (userId, doc, fieldNames, modifier, options) {
//     modifier.$set = modifier.$set || {};
//
//     if (modifier.$set.discountAmount == null) {
//         modifier.$set.discountAmount = 0;
//     } else if (modifier.$set.discountAmountUsd == null) {
//         modifier.$set.discountAmountUsd = 0;
//     } else if (modifier.$set.discountAmountThb == null) {
//         modifier.$set.discountAmountThb = 0;
//     }
//
//     modifier.$set.balanceKhr = modifier.$set.total + modifier.$set.lastOrderBalanceKhr;
//     modifier.$set.balanceUsd = modifier.$set.totalUsd + modifier.$set.lastOrderBalanceUsd;
//     modifier.$set.balanceThb = modifier.$set.totalThb + modifier.$set.lastOrderBalanceThb;
// });

OrderVip.after.update(function (userId, doc) {

    if (doc.discountAmount == null) {
        doc.discountAmount = 0;
    } else if (doc.discountAmountUsd == null) {
        doc.discountAmountUsd = 0;
    } else if (doc.discountAmountThb == null) {
        doc.discountAmountThb = 0;
    }

    let balanceKhr = doc.total + doc.lastOrderBalanceKhr;
    let balanceUsd = doc.totalUsd + doc.lastOrderBalanceUsd;
    let balanceThb = doc.totalThb + doc.lastOrderBalanceThb;

    OrderVip.direct.update({_id: doc._id}, {
        $set: {
            balanceKhr: balanceKhr,
            balanceUsd: balanceUsd,
            balanceThb: balanceThb
        }
    });
});

OrderVip.after.remove(function (userId, doc) {
    OrderVipPayment.remove({orderVipId: doc._id});
});