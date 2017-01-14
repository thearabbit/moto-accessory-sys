import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../imports/libs/selectOpts.js';
import {getLookupValue} from '../../imports/libs/getLookupValue.js';

export const OrderVip = new Mongo.Collection("moto_orderVip");

// Items sub schema
OrderVip.itemsSchema = new SimpleSchema({
    _id: {
        type: String,
        label: 'Id'
    },
    itemId: {
        type: String,
        label: 'Item'
    },
    qty: {
        type: Number,
        label: 'Qty',
        min: 1
    },
    unit: {
        type: String,
        label: "Unit"
    },
    currencyId: {
        type: String,
        label: 'Currency'
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
        type: String,
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
OrderVip.schema = new SimpleSchema({
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
            type: 'select2'
        }
    },
    type: {
        type: String,
        label: 'Type',
        defaultValue: 'Vip',
        autoform: {
            type: "select-radio-inline",
            options: function () {
                return [{label: "Vip", value: "Vip"}];
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
    items: {
        type: [OrderVip.itemsSchema],
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
        label: 'Discount Amount',
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
        },
        optional: true
    },
    subTotalUsd: {
        type: Number,
        label: 'Subtotal (USD)',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        },
        optional: true
    },
    discountAmountUsd: {
        type: Number,
        label: 'Discount Amount (USD)',
        decimal: true,
        defaultValue: 0,
        min: 0,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        },
        optional: true
    },
    totalUsd: {
        type: Number,
        label: 'Total (USD)',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency();
            }
        },
        optional: true
    },
    subTotalThb: {
        type: Number,
        label: 'Subtotal (USD)',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "B"});
            }
        },
        optional: true
    },
    discountAmountThb: {
        type: Number,
        label: 'Discount Amount (USD)',
        decimal: true,
        defaultValue: 0,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "B"});
            }
        },
        optional: true
    },
    totalThb: {
        type: Number,
        label: 'Total (USD)',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "B"});
            }
        },
        optional: true
    },
    lastOrderBalanceKhr: {
        type: Number,
        label: 'Last Balance Khr',
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "៛ ", placeholder: ""});
            }
        },
        optional: true
    },
    lastOrderBalanceUsd: {
        type: Number,
        label: 'Last Balance Usd',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "$ ", placeholder: ""});
            }
        },
        optional: true
    },
    lastOrderBalanceThb: {
        type: Number,
        label: 'Last Balance Thb',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "B ", placeholder: ""});
            }
        },
        optional: true
    },
    balanceKhr: {
        type: Number,
        label: 'Balance',
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "៛ ", placeholder: ""});
            }
        },
        optional: true
    },
    balanceUsd: {
        type: Number,
        label: 'Balance',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "$ ", placeholder: ""});
            }
        },
        optional: true
    },
    balanceThb: {
        type: Number,
        label: 'Balance',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: "B ", placeholder: ""});
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

OrderVip.attachSchema(OrderVip.schema);
