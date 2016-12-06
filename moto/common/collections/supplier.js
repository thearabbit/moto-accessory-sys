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
    companyName: {
        type: String,
        label: "Company Name"
    },
    contact: {
        type: String,
        label: "Contact",
        optional: true
    },
    branchId: {
        type: String
    }
});

Supplier.attachSchema([
    Supplier.generalSchema
]);
