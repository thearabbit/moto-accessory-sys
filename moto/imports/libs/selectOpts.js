import {Meteor} from  'meteor/meteor';
import {_} from 'meteor/erasaur:meteor-lodash';

// Collection
import {Branch} from '../../../core/common/collections/branch';
import {Currency} from '../../../core/common/collections/currency';
import {Unit} from '../../../moto/common/collections/unit';
import {Customer} from '../../../moto/common/collections/customer';

export const SelectOpts = {
    branch: function (selectOne) {
        let list = [];
        if (selectOne) {
            list.push({label: "(Select One)", value: ""});
        }

        Branch.find()
            .forEach(function (obj) {
                list.push({label: obj.enName, value: obj._id});
            });

        return list;
    },
    currency: function (selectOne) {
        let list = [];
        if (selectOne) {
            list.push({label: '(Select One)', value: ''});
        }

        Currency.find()
            .forEach(function (obj) {
                list.push({label: obj._id + ' (' + obj.num + ')', value: obj._id})
            });

        return list;
    },
    gender: function (selectOne) {
        let list = [];
        if (selectOne) {
            list.push({label: "(Select One)", value: ""});
        }
        list.push({label: "Male", value: "M"});
        list.push({label: "Female", value: "F"});

        return list;
    },
    unit: function (selectOne) {
        let list = [];
        if (selectOne) {
            list.push({label: '(Select One)', value: ''});
        }

        Unit.find()
            .forEach(function (obj) {
                list.push({label: obj._id + ' (' + obj.name + ')', value: obj._id})
            });

        return list;
    },
    customer: function (selectOne) {
        let list = [];
        if (selectOne) {
            list.push({label: '(Select One)', value: ''});
        }
        let currentBranch = Session.get('currentBranch'), customerType = Session.get('customerType');
        Customer.find({branchId: currentBranch, type: customerType})
            .forEach(function (obj) {
                list.push({label: obj._id + ' : ' + obj.name, value: obj._id})
            });

        return list;
    }
};