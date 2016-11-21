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
    gender: {
        type: String,
        label: 'Gender',
        defaultValue: 'M',
        autoform: {
            type: "select-radio-inline",
            options: function () {
                return getLookupValue('Gender');
            }
        }
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
    startDate: {
        type: Date,
        label: 'Start Date',
        defaultValue: moment().toDate(),
        autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    format: 'DD/MM/YYYY',
                    showTodayButton: true
                }
            }
        }
    },
    address: {
        type: String,
        label: 'Address'
    },
    email: {
        type: String,
        label: 'Email',
        regEx: SimpleSchema.RegEx.Email,
        optional: true
    },
    branchId: {
        type: String
    }
});

Employee.contactSchema = new SimpleSchema({
    contact: {
        type: [Object],
        label: 'Contact',
        minCount: 1,
        maxCount: 3
    },
    'contact.$.type': {
        type: String,
        label: 'Type',
        autoform: {
            type: "select",
            options: function () {
                return getLookupValue('Contact Type');
            }
        }
    },
    'contact.$.number': {
        type: String,
        label: 'Number',
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.phone();
            }
        }
    },
});

Employee.attachSchema([
    Employee.generalSchema,
    Employee.contactSchema
]);
