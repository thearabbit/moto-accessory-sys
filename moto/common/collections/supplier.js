import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../imports/libs/selectOpts.js';
import {getLookupValue} from '../../imports/libs/getLookupValue.js';

export const Supplier = new Mongo.Collection("moto_supplier");

Supplier.generalSchema = new SimpleSchema({
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
    companyName: {
        type: String,
        label:"Company Name"
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
    },
    email: {
        type: String,
        label: 'Email',
        regEx: SimpleSchema.RegEx.Email,
        optional: true
    },
    memo: {
        type: String,
        label: 'Memo',
        optional: true
    },
    branchId: {
        type: String
    }
});

Supplier.contactSchema = new SimpleSchema({
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

Supplier.attachSchema([
    Supplier.generalSchema,
    Supplier.contactSchema
]);
