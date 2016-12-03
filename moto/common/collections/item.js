import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';

// Lib
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../imports/libs/selectOpts';
import {getLookupValue} from '../../imports/libs/getLookupValue.js';

export const Item = new Mongo.Collection("moto_item");

Item.schema = new SimpleSchema({
    type: {
        type: String,
        label: 'Type',
        defaultValue: 'I',
        autoform: {
            type: "select-radio-inline",
            options: function () {
                return [{label: "Item", value: "I"}];
            }
            // options: function () {
            //     return getLookupValue('Item Type');
            // }
        }
    },
    name: {
        type: String,
        max: 200,
    },
    parent: {
        type: String,
        optional: true,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Select One',
                optionsMethod: 'moto.selectOptsMethod.item',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        return {type: 'C'};
                    }
                }
            }
        }
    },
    code: {
        type: String,
        label: 'Code',
        optional: true
    },
    unit: {
        type: String,
        label: "Unit",
        autoform: {
            type: "select2",
            options: function () {
                return SelectOpts.unit('selectOne', true);
            }
        },
        optional: true
    },
    currencyId: {
        type: String,
        defaultValue: 'USD',
        autoform: {
            type: "select-radio-inline",
            options: function () {
                return SelectOpts.currency();
            }
        },
        custom: function () {
            if (this.field('type').value == 'I' && !this.value) {
                return 'required';
            }
        }
    },
    price: {
        type: Number,
        decimal: true,
        label: "Price",
        min: 0,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                if (Meteor.isClient) {
                    let prefix = AutoForm.getFieldValue('currencyId') || '$';

                    if (prefix == 'KHR') {
                        prefix = '៛'
                    } else if (prefix == 'USD') {
                        prefix = '$';
                    } else if (prefix == 'THB') {
                        prefix = 'B';
                    }

                    return inputmaskOptions.currency({prefix: prefix});
                }
            }
        },
        custom: function () {
            if (this.field('type').value == 'I' && !this.value) {
                return 'required';
            }
        }
    },
    khrPrice: {
        type: Number,
        decimal: true,
        min: 0,
        label: "Khr Price",
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                return inputmaskOptions.currency({prefix: '៛'});
            }
        },
        custom: function () {
            if (this.field('type').value == 'I' && !this.value) {
                return 'required';
            }
        }
    },
    purchase: {
        type: Number,
        decimal: true,
        label: "Purchase Price",
        min: 0,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: function () {
                if (Meteor.isClient) {
                    let prefix = AutoForm.getFieldValue('currencyId') || '$';

                    if (prefix == 'KHR') {
                        prefix = '៛'
                    } else if (prefix == 'USD') {
                        prefix = '$';
                    } else if (prefix == 'THB') {
                        prefix = 'B';
                    }

                    return inputmaskOptions.currency({prefix: prefix});
                }
            }
        },
        custom: function () {
            if (this.field('type').value == 'I' && !this.value) {
                return 'required';
            }
        }
    },
    supplierId: {
        type: String,
        optional: true,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Select One',
                optionsMethod: 'moto.selectOptsMethod.supplier'
            }
        },
        custom: function () {
            if (this.field('type').value == 'I' && !this.value) {
                return 'required';
            }
        }
    },
    photo: {
        type: String,
        optional: true,
        autoform: {
            afFieldInput: {
                type: 'fileUpload',
                collection: 'Files',
                accept: 'image/*'
            }
        }
    },
    ancestors: {
        type: [String],
        optional: true
    },
    order: {
        type: String,
        optional: true
    }
});

Meteor.startup(function () {
    Item.schema.i18n("moto.item.schema");
    Item.attachSchema(Item.schema);
});
