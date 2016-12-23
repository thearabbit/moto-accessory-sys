import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {Item} from '../../common/collections/item.js';

Meteor.publish('moto.items', function simpleItems() {
    this.unblock();

    if (!this.userId) {
        return this.ready();
    }

    Meteor._sleepForMs(200);

    return Item.find();
});
