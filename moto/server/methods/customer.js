import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';

// Collection
import {Customer} from '../../common/collections/customer.js';

// select2
Meteor.methods({
    findCustomer({selectOne, customerType, branch}) {
        let list = [];
        if (selectOne) {
            list.push({label: '(Select One)', value: ''});
        }

        Customer.find({$and: [{type: customerType}, {branchId: branch}]})
            .forEach(function (obj) {
                list.push({label: obj._id + ' : ' + obj.name, value: obj._id})
            });

        return list;
    }
});