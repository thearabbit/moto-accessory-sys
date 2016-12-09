import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../imports/libs/selectOpts.js';

export const OrderPayment = new Mongo.Collection("moto_orderPayment");

// OrderPayment schema
OrderPayment.schema = new SimpleSchema({
    paidDate: {
        type: Date,
        label: 'Paid date',
        defaultValue: moment().toDate(),
        autoform: {
            afFieldInput: {
                type: "bootstrap-datetimepicker",
                dateTimePickerOptions: {
                    format: 'DD/MM/YYYY hh:mm:ss',
                    showTodayButton: true
                }
            }
        }
    },
    customerId: {
        type: String,
        label: 'Customer',
        // autoform: {
        //     type: 'universe-select',
        //     afFieldInput: {
        //         uniPlaceholder: 'Select One',
        //         optionsMethod: 'moto.selectOptsMethod.customer',
        //         optionsMethodParams: function () {
        //             if (Meteor.isClient) {
        //                 let currentBranch = Session.get('currentBranch');
        //                 return {branchId: currentBranch};
        //             }
        //         }
        //     }
        // }
    },
    orderId: {
        type: String,
        label: 'Order Id',
        // autoform: {
        //     type: 'universe-select',
        //     afFieldInput: {
        //         uniPlaceholder: 'Select One',
        //         optionsMethod: 'moto.selectOptsMethod.order',
        //         optionsMethodParams: function () {
        //             if (Meteor.isClient) {
        //                 let currentBranch = Session.get('currentBranch');
        //                 return {branchId: currentBranch};
        //             }
        //         }
        //     }
        // }
    },
    employeeId: {
        type: String,
        label: 'Employee',
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Select One',
                optionsMethod: 'moto.selectOptsMethod.employee',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        let currentBranch = Session.get('currentBranch');
                        return {branchId: currentBranch};
                    }
                }
            }
        }
    },
    dueAmount: {
        type: Number,
        label: 'Due amount',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "៛"});
            }
        }
    },
    paidAmount: {
        type: Number,
        label: 'Paid amount',
        defaultValue: 0,
        min: 50,
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "៛"});
            }
        },
        custom: function () {
            if (this.value > this.field('dueAmount').value) {
                return "greaterThanDue";
            }
        },
    },
    status: {
        type: String,
        label: "Status",
        optional: true
    },
    balance: {
        type: Number,
        label: 'Balance',
        decimal: true,
        defaultValue: 0,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "៛"});
            }
        }
    },
    des: {
        type: String,
        label: 'Description',
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'summernote',
                class: 'editor', // optional
                settings: {
                    height: 150,                 // set editor height
                    minHeight: null,             // set minimum height of editor
                    maxHeight: null,             // set maximum height of editor
                    toolbar: [
                        ['font', ['bold', 'italic', 'underline', 'clear']], //['font', ['bold', 'italic', 'underline', 'clear']],
                        ['para', ['ul', 'ol']] //['para', ['ul', 'ol', 'paragraph']],
                        //['insert', ['link', 'picture']], //['insert', ['link', 'picture', 'hr']],
                    ]
                } // summernote options goes here
            }
        }
    },
    branchId: {
        type: String
    }
});

OrderPayment.attachSchema(OrderPayment.schema);

SimpleSchema.messages({
    "greaterThanDue": "Paid Amount Can't Be Greater Than Due Amount",
});