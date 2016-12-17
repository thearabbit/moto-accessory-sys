import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../imports/libs/selectOpts.js';
import {getLookupValue} from '../../imports/libs/getLookupValue.js';

export const Customer = new Mongo.Collection("moto_customer");

Customer.generalSchema = new SimpleSchema({
    name: {
        type: String,
        label: 'Name'
    },
    gender: {
        type: String,
        label: 'Gender',
        autoform: {
            type: "select-radio-inline",
            options: function () {
                return getLookupValue('Gender');
            }
        },
        optional: true
    },
    age: {
        type: Number,
        label: "Age",
        min: 1,
        max: 100,
        optional: true
    },
    type: {
        type: String,
        label: 'Type',
        defaultValue: 'Retail',
        autoform: {
            type: "select-radio-inline",
            options: function () {
                return getLookupValue('Customer Type');
            }
        }
    },
    locationId: {
        type: String,
        label: 'Location',
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Select One',
                optionsMethod: 'moto.selectOptsMethod.location',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        return {type: 'V'};
                    }
                }
            }
        },
        optional: true
    },
    address: {
        type: String,
        label: 'Address',
        optional: true
    },
    contact: {
        type: String,
        label: "Contact",
        optional: true
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


Customer.attachSchema([
    Customer.generalSchema
]);
