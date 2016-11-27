import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/erasaur:meteor-lodash';

import {LookupValue} from '../../common/collections/lookupValue';

Meteor.startup(function () {
    if (LookupValue.find().count() == 0) {
        const data = [
            // Prefix
            {
                name: 'Prefix',
                private: true,
                options: [
                    {label: 'Mr', value: 'Mr', order: 1},
                    {label: 'Miss', value: 'Miss', order: 2},
                    {label: 'Ms', value: 'Ms', order: 3},
                    {label: 'Mrs', value: 'Mrs', order: 4}
                ]
            },
            // Gender
            {
                name: 'Gender',
                private: true,
                options: [
                    {label: 'Male', value: 'M', order: 1},
                    {label: 'Female', value: 'F', order: 2},
                ]
            },
            // Customer Type
            {
                name: 'Customer Type',
                private: false,
                options: [
                    {label: 'Retail', value: 'Retail', order: 1},
                    {label: 'Whole', value: 'Whole', order: 2},
                    {label: 'Vip', value: 'Vip', order: 3},
                ]
            },
            // Order Type
            {
                name: 'Order Type',
                private: false,
                options: [
                    {label: 'Retail', value: 'Retail', order: 1},
                    {label: 'Whole', value: 'Whole', order: 2}
                ]
            },
            // Discount Type
            {
                name: 'Discount Type',
                private: false,
                options: [
                    {label: 'Percentage', value: 'Percentage', order: 1},
                    {label: 'Amount', value: 'Amount', order: 2}
                ]
            },
            // Employee Position
            {
                name: 'Employee Position',
                private: false,
                options: [
                    {label: 'Manager', value: 'Manager', order: 1},
                    {label: 'Accountant', value: 'Accountant', order: 2},
                    {label: 'Cashier', value: 'Cashier', order: 3},
                ]
            },
            // Contact Type
            {
                name: 'Contact Type',
                private: false,
                options: [
                    {label: 'Mobile', value: 'M', order: 1},
                    {label: 'Home', value: 'H', order: 2},
                    {label: 'Work', value: 'W', order: 3},
                ]
            },
            // Location Type
            {
                name: 'Location Type',
                private: false,
                options: [
                    {label: 'Province', value: 'P', order: 1},
                    {label: 'District', value: 'D', order: 2},
                    {label: 'Commune', value: 'C', order: 3},
                    {label: 'Village', value: 'V', order: 4},
                ]
            },
            // Item Type
            {
                name: 'Item Type',
                private: false,
                options: [
                    {label: 'Category', value: 'C', order: 1},
                    {label: 'Item', value: 'I', order: 2},
                ]
            },
        ];

        _.forEach(data, (value)=> {
            LookupValue.insert(value);
        });
    }
});