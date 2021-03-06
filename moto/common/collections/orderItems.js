import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {ReactiveVar} from 'meteor/reactive-var';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../imports/libs/selectOpts';
import {SelectOptsMethod} from '../../common/methods/selectOptsMethod';
// Method
import {lookupItem} from '../methods/lookupItem.js';

export const OrderItemsSchema = new SimpleSchema({
    _id: {
        type: String,
        label: 'Id',
        optional: true
    },
    orderIndex: {
        type: Number,
        optional: true
    },
    itemId: {
        type: String,
        label: 'Item',
        autoform: {
            type: "select2"
        }
    },
    secretCode: {
        type: String,
        optional: true
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
                if (Meteor.isClient) {
                    let prefix = AutoForm.getFieldValue('currencyId') || '$';

                    if (prefix == 'KHR') {
                        prefix = '៛ '
                    } else if (prefix == 'USD') {
                        prefix = '$ ';
                    } else if (prefix == 'THB') {
                        prefix = 'B ';
                    }

                    return inputmaskOptions.currency({prefix: prefix});
                }
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
                if (Meteor.isClient) {
                    let prefix = AutoForm.getFieldValue('currencyId') || '$';

                    if (prefix == 'KHR') {
                        prefix = '៛ '
                    } else if (prefix == 'USD') {
                        prefix = '$ ';
                    } else if (prefix == 'THB') {
                        prefix = 'B ';
                    }

                    return inputmaskOptions.currency({prefix: prefix, placeholder: ""});
                }
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
                return inputmaskOptions.currency({prefix: '៛ '});
            }
        }
    },
    orderPrice: {
        type: Number,
        label: 'Order Price',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: '៛ '});
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
                return inputmaskOptions.currency({prefix: '៛ '});
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
                if (Meteor.isClient) {
                    let type, discountType = Session.get('discountType');
                    if (discountType == 'Percentage' || discountType == "%") {
                        type = inputmaskOptions.percentage();
                    } else {
                        type = inputmaskOptions.currency({prefix: '៛ '});
                    }

                    return type;
                }
            }
        },
        optional: true
    },
    discountType: {
        type: String,
        optional: true
    },
    totalAmount: {
        type: Number,
        label: 'Total amount',
        decimal: true,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                if (Meteor.isClient) {
                    return inputmaskOptions.currency({prefix: '៛ '});
                }
            }
        }
    },
    memo: {
        type: String,
        label: 'Memo',
        optional: true
    }
});
