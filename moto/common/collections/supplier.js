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
    // gender: {
    //     type: String,
    //     label: 'Gender',
    //     defaultValue: 'M',
    //     autoform: {
    //         type: "select-radio-inline",
    //         options: function () {
    //             return getLookupValue('Gender');
    //         }
    //     }
    // },
    companyName: {
        type: String,
        label:"Company Name"
    },
    // locationId: {
    //     type: String,
    //     label: 'Location',
    //     autoform: {
    //         type: 'universe-select',
    //         afFieldInput: {
    //             uniPlaceholder: 'Select One',
    //             optionsMethod: 'moto.selectOptsMethod.location',
    //             optionsMethodParams: function () {
    //                 if (Meteor.isClient) {
    //                     return {type: 'V'};
    //                 }
    //             }
    //         }
    //     },
    // },
    // email: {
    //     type: String,
    //     label: 'Email',
    //     regEx: SimpleSchema.RegEx.Email,
    //     optional: true
    // },
    // memo: {
    //     type: String,
    //     label: 'Memo',
    //     optional: true
    // },
    branchId: {
        type: String
    }
});

Supplier.attachSchema([
    Supplier.generalSchema
]);
