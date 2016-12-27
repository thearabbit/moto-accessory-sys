import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {OrderPayment} from '../../common/collections/orderPayment.js';

Meteor.publish('moto.orderPayment', function simpleOrderPayment() {
    this.unblock();

    if (!this.userId) {
        return this.ready();
    }

    return OrderPayment.find();
});
