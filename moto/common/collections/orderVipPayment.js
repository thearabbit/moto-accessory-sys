import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../imports/libs/selectOpts.js';

export const OrderVipPayment = new Mongo.Collection("moto_orderVipPayment");

// OrderPayment schema
OrderVipPayment.schema = new SimpleSchema({
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
    },
    orderVipId: {
        type: String,
        label: 'Order Id',
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
    dueAmountKhr: {
        type: Number,
        label: 'Due Amount Khr',
        defaultValue: 0,
        decimal: true,
        optional: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "៛", placeholder: ""});
            }
        }
    },
    paidAmountKhr: {
        type: Number,
        label: 'Paid Amount Khr',
        defaultValue: 0,
        decimal: true,
        optional: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "៛", placeholder: ""});
            }
        },
        custom: function () {
            if (this.value > this.field('dueAmountKhr').value) {
                return "greaterThanDue";
            } else if (this.dueAmountKhr > 0) {
                return 'required';
            }
        }
    },
    balanceKhr: {
        type: Number,
        label: 'Balance Khr',
        decimal: true,
        optional: true,
        defaultValue: 0,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "៛ ", placeholder: ""});
            }
        },
        custom: function () {
            if (this.dueAmountKhr > 0) {
                return 'required';
            }
        }
    },
    dueAmountUsd: {
        type: Number,
        label: 'Due Amount Usd',
        decimal: true,
        optional: true,
        defaultValue: 0,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({placeholder: ""});
            }
        }
    },
    paidAmountUsd: {
        type: Number,
        label: 'Paid Amount Usd',
        defaultValue: 0,
        decimal: true,
        optional: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({placeholder: ""});
            }
        },
        custom: function () {
            if (this.value > this.field('dueAmountUsd').value) {
                return "greaterThanDue";
            } else if (this.dueAmountUsd > 0) {
                return 'required';
            }
        }
    },
    balanceUsd: {
        type: Number,
        label: 'Balance Usd',
        decimal: true,
        optional: true,
        defaultValue: 0,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({placeholder: ""});
            }
        },
        custom: function () {
            if (this.dueAmountUsd > 0) {
                return 'required';
            }
        }
    },
    dueAmountThb: {
        type: Number,
        label: 'Due Amount Thb',
        decimal: true,
        optional: true,
        defaultValue: 0,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "B ", placeholder: ""});
            }
        }
    },
    paidAmountThb: {
        type: Number,
        label: 'Paid Amount Thb',
        defaultValue: 0,
        decimal: true,
        optional: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "B ", placeholder: ""});
            }
        },
        custom: function () {
            if (this.value > this.field('dueAmountThb').value) {
                return "greaterThanDue";
            } else if (this.dueAmountThb > 0) {
                return "required";
            }
        }
    },
    balanceThb: {
        type: Number,
        label: 'Balance Thb',
        decimal: true,
        optional: true,
        defaultValue: 0,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "B ", placeholder: ""});
            }
        },
        custom: function () {
            if (this.dueAmountThb > 0) {
                return 'required';
            }
        }
    },
    status: {
        type: String,
        label: "Status",
        optional: true
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

OrderVipPayment.attachSchema(OrderVipPayment.schema);

SimpleSchema.messages({
    "greaterThanDue": "Paid Amount Can't Be Greater Than Due Amount",
});