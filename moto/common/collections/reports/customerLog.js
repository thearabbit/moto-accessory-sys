import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Method
import {SelectOptsMethod} from '../../methods/selectOptsMethod';

// Lib
import {SelectOpts} from '../../../imports/libs/selectOpts.js';

export const CustomerLogSchema = new SimpleSchema({
    branchId: {
        type: [String],
        label: 'Branch',
        autoform: {
            type: "select2",
            multiple: true,
            options: function () {
                return SelectOpts.branch(false);
            }
        }
    },
    repDate: {
        type: [Date],
        label: 'Date',
        autoform: {
            type: "bootstrap-daterangepicker",
            afFieldInput: {
                dateRangePickerOptions: function () {
                    return dateRangePickerOptions;
                }
            }
        }
    },
    customerId: {
        type: String,
        label: 'Customer',
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Please search... (limit 10)',
                optionsPlaceholder: 'Please search... (limit 10)',
                optionsMethod: 'moto.selectOptsMethod.customerForReport',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        let currentBranch = Session.get('currentBranch');
                        return {branchId: currentBranch, type: "Vip"};
                    }
                }
            }
        }
    },
    exchangeId: {
        type: String,
        label: 'Exchange',
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Please search... (limit 10)',
                optionsPlaceholder: 'Please search... (limit 10)',
                optionsMethod: 'moto.selectOptsMethod.exchange'
            }
        },
        optional: true
    },
    mode: {
        type: String,
        label: 'Mode',
        defaultValue: "Simple Mode",
        autoform: {
            type: "select2",
            options: function () {
                return [
                    {label: "Simple Mode", value: 'Simple Mode'},
                    {label: "Detail Mode", value: 'Detail Mode'},
                ];
            }
        },
        optional: true
    }
});
