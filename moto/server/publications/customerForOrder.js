import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';

// Collection
import {Customer} from '../../common/collections/customer.js';

Meteor.publish('moto.customerForOrder', function simpleCustomer() {
    this.unblock();

    if (!this.userId) {
        return this.ready();
    }

    return Customer.find();
});