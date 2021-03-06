import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {AutoForm} from 'meteor/aldeed:autoform';

// Lib
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';
import {SelectOpts} from '../../imports/libs/selectOpts.js';
import {getLookupValue} from '../../imports/libs/getLookupValue.js';

export const Location = new Mongo.Collection("moto_location");

Location.schema = new SimpleSchema({
    type: {
        type: String,
        label: 'Type',
        defaultValue: 'P',
        autoform: {
            type: "select-radio-inline",
            options: function () {
                return getLookupValue('Location Type');
            }
        }
    },
    parent: {
        type: String,
        label: function () {
            return Spacebars.SafeString('Parent <span class="text-red">*</span>');
        },
        optional: true,
        autoform: {
            type: 'universe-select',
            afFieldInput: {
                uniPlaceholder: 'Select One',
                optionsMethod: 'moto.selectOptsMethod.location',
                optionsMethodParams: function () {
                    if (Meteor.isClient) {
                        let typeVal;
                        let type = AutoForm.getFieldValue('type');

                        switch (type) {
                            case 'D':
                                typeVal = 'P';
                                break;
                            case 'C':
                                typeVal = 'D';
                                break;
                            case 'V':
                                typeVal = 'C';
                                break;
                        }

                        return {type: typeVal};
                    }
                }
            }
        },
        custom: function () {
            if (this.field('type').value != 'P' && !this.value) {
                return 'required';
            }
        }
    },
    code: {
        type: String,
        label: 'Code',
        min: 2,
        max: 8,
        autoform: {
            type: 'inputmask',
            inputmaskOptions: {
                mask: "99"
            }
        },
    },
    khName: {
        type: String,
        label: 'Kh name',
        // autoform: {
        //     type: "textarea"
        // }
    },
    enName: {
        type: String,
        label: 'En name',
        // autoform: {
        //     type: "textarea"
        // }
    },
    ancestors: {
        type: [String],
        optional: true
    },
});

Location.attachSchema(Location.schema);
