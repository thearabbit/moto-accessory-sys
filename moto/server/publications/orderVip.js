import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {OrderVip} from '../../common/collections/orderVip.js';

Meteor.publish('moto.orderVipById', function simpleOrderVip(orderVipId) {
    this.unblock();

    new SimpleSchema({
        orderVipId: {type: String}
    }).validate({orderVipId});

    if (!this.userId) {
        return this.ready();
    }

    return OrderVip.find({_id: orderVipId});
});
