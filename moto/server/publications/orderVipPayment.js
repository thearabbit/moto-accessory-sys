import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {OrderVipPayment} from '../../common/collections/orderVipPayment.js';

Meteor.publish('moto.orderVipPayment', function simpleOrderVipPayment() {
    this.unblock();

    if (!this.userId) {
        return this.ready();
    }

    return OrderVipPayment.find();
});
