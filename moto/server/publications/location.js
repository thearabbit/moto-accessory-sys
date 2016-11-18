import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {Location} from '../../common/collections/location.js';

Meteor.publish('moto.locationById', function motoLocationById(locationId) {
    this.unblock();

    new SimpleSchema({
        locationId: {type: String},
    }).validate({locationId});

    if (!this.userId) {
        return this.ready();
    }

    Meteor._sleepForMs(200);

    return Location.find({_id: locationId});
});
