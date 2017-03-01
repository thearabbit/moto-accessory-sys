import 'meteor/theara:collection-cache';

// Collection
import {OrderVip} from '../../common/collections/orderVip.js';
import {Customer} from '../../common/collections/customer.js';

// Order.cacheTimestamp();
OrderVip.cacheDoc('customer', Customer, ['name']);
