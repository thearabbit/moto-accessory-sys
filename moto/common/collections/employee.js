import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../imports/libs/selectOpts.js';
import {getLookupValue} from '../../imports/libs/getLookupValue.js';

export const Employee = new Mongo.Collection("moto_employee");

Employee.generalSchema = new SimpleSchema({
    name: {
        type: String,
        label: 'Name'
    },
    position: {
        type: String,
        label: 'Position',
        defaultValue: 'Cashier',
        autoform: {
            type: "select-radio-inline",
            options: function () {
                return getLookupValue('Employee Position');
            }
        }
    },
    contact: {
        type: String,
        label: "Contact"
    },
    address: {
        type: String,
        label: 'Address',
        optional: true
    },
    branchId: {
        type: String
    }
});


Employee.attachSchema([
    Employee.generalSchema
]);
