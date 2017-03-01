import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {Customer} from '../../common/collections/customer.js';
import {Order} from '../../common/collections/order.js';
import {OrderPayment} from '../../common/collections/orderPayment.js';
import {OrderVip} from '../../common/collections/orderVip.js';
import {OrderVipPayment} from '../../common/collections/orderVipPayment.js';

Customer.before.insert(function (userId, doc) {
    let prefix = doc.branchId + '-';
    doc._id = idGenerator.genWithPrefix(Customer, prefix, 4);
});

Customer.after.remove(function (userId, doc) {
    Order.remove({customerId: doc._id});
    OrderPayment.remove({customerId: doc._id});
    OrderVip.remove({customerId: doc._id});
    OrderVipPayment.remove({customerId: doc._id});
});