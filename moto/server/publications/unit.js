import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {Unit} from '../../common/collections/unit.js';

Meteor.publish('moto.unit', function simpleUnit() {
    this.unblock();

    if (!this.userId) {
        return this.ready();
    }

    Meteor._sleepForMs(200);

    return Unit.find();
});
