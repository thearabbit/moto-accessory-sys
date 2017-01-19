import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../imports/libs/selectOpts.js';
import {getLookupValue} from '../../imports/libs/getLookupValue.js';

export const Order = new Mongo.Collection("moto_order");

// Items sub schema
Order.itemsSchema = new SimpleSchema({
    _id: {
        type: String,
        label: 'Id'
    },
    date: {
        type: Date
    },
    itemId: {
        type: String,
        label: 'Item'
    },
    memoItem: {
        type: String,
        label: 'Memo Item',
        optional: true
    },
    qty: {
        type: Number,
        label: 'Qty',
        // min: 1,
        decimal: true
    },
    unit: {
        type: String,
        label: "Unit"
    },
    currencyId: {
        type: String,
        label: 'Currency'
    },
    price: {
        type: Number,
        label: 'Price',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    purchasePrice: {
        type: Number,
        label: 'Purchase Price',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    khrPrice: {
        type: Number,
        label: 'Khr Price',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    orderPrice: {
        type: Number,
        label: 'Price',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    amount: {
        type: Number,
        label: 'Amount',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        }
    },
    discount: {
        type: Number,
        label: 'Discount',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.percentage();
            }
        }
    },
    discountType: {
        type: String
    },
    totalAmount: {
        type: Number,
        label: 'Total amount',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.percentage();
            }
        }
    },
    memo: {
        type: String,
        label: 'Memo',
        optional: true
    }
});

// Order schema
Order.schema = new SimpleSchema({
    orderDate: {
        type: Date,
        label: 'Order date',
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
        autoform: {
            type: "select2",
            options: function () {
                return SelectOpts.customer("selectOne", true);
            }
        }
    },
    type: {
        type: String,
        label: 'Type',
        defaultValue: 'Whole',
        autoform: {
            type: "select-radio-inline",
            options: function () {
                return getLookupValue('Order Type');
            }
        }
    },
    discountType: {
        type: String,
        label: 'Discount Type',
        defaultValue: 'Percentage',
        autoform: {
            type: "select-radio-inline",
            options: function () {
                return getLookupValue('Discount Type');
            }
        }
    },
    employeeId: {
        type: String,
        label: 'Employee',
        defaultValue: "001-001",
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
    exchangeId: {
        type: String,
        label: 'Exchange',
        optional: true,
        defaultValue: "001",
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Please search... (limit 10)',
                optionsPlaceholder: 'Please search... (limit 10)',
                optionsMethod: 'moto.selectOptsMethod.exchange'
            }
        },
        custom: function () {
            if (this.field('type').value == 'Whole' && !this.value) {
                return 'required';
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
                    height: 75,                 // set editor height
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
    items: {
        type: [Order.itemsSchema],
    },
    lastOrderBalance: {
        type: Number,
        label: 'Last Order Balance',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "៛ ", placeholder: ""});
            }
        },
        optional: true
    },
    subTotal: {
        type: Number,
        label: 'Subtotal',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "៛"});
            }
        },
        optional: true
    },
    discountAmount: {
        type: Number,
        label: 'Discount amount',
        decimal: true,
        defaultValue: 0,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "៛"});
            }
        },
        optional: true
    },
    total: {
        type: Number,
        label: 'Total',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "៛"});
            }
        }
    },
    balance: {
        type: Number,
        label: 'Balance',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "៛"});
            }
        },
        optional: true
    },
    status: {
        type: String,
        defaultValue: "Partial"
    },
    closedDate: {
        type: Date,
        optional: true
    },
    printId: {
        type: String,
        optional: true
    },
    branchId: {
        type: String
    }
});

Order.attachSchema(Order.schema);
