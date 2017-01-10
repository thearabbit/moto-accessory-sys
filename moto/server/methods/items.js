import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';

// Collection
import {Item} from '../../common/collections/item.js';

// select2
Meteor.methods({
    findItems(selectOne) {
        let list = [];
        if (selectOne) {
            list.push({label: '(Select One)', value: ''});
        }

        Item.find()
            .forEach(function (obj) {
                list.push({label: obj._id + ' : ' + obj.name, value: obj._id})
            });

        return list;
    }
});