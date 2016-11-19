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
        defaultValue: 'C',
        autoform: {
            type: "select-radio-inline",
            options: function () {
                return getLookupValue('Item Type');
            }
        }
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
        min: 1,
        // max: 8,
        // autoform: {
        //     type: 'inputmask',
        //     inputmaskOptions: {
        //         mask: "99"
        //     }
        // },
    },
    name: {
        type: String,
        unique: true,
        max: 200
    },
    currencyId: {
        type: String,
        defaultValue: 'USD',
        optional: true,
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
        min: 0,
        optional: true,
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
        optional: true,
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
    // des: {
    //     type: String,
    //     label: 'Description',
    //     optional: true,
    //     autoform: {
    //         afFieldInput: {
    //             type: 'summernote',
    //             class: 'editor', // optional
    //             settings: {
    //                 height: 150,                 // set editor height
    //                 minHeight: null,             // set minimum height of editor
    //                 maxHeight: null,             // set maximum height of editor
    //                 toolbar: [
    //                     ['font', ['bold', 'italic', 'underline', 'clear']], //['font', ['bold', 'italic', 'underline', 'clear']],
    //                     ['para', ['ul', 'ol']] //['para', ['ul', 'ol', 'paragraph']],
    //                     //['insert', ['link', 'picture']], //['insert', ['link', 'picture', 'hr']],
    //                 ]
    //             } // summernote options goes here
    //         }
    //     }
    // },
    supplierId: {
        type: String,
        optional: true,
        autoform: {
            type: "select",
            options: function () {
                return [
                    {label: 'Rabbit', value: 'Rabbit'},
                    {label: 'Apple', value: 'Apple'}
                ];
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
