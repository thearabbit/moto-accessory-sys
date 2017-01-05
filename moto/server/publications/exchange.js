import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {Exchange} from '../../../core/common/collections/exchange.js';

Meteor.publish('moto.exchange', function motoExchange() {
    this.unblock();

    if (!this.userId) {
        return this.ready();
    }

    Meteor._sleepForMs(200);

    return Exchange.find();
});
