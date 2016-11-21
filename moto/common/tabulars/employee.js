import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import Tabular from 'meteor/aldeed:tabular';
import {EJSON} from 'meteor/ejson';
import {moment} from 'meteor/momentjs:moment';
import {_} from 'meteor/erasaur:meteor-lodash';
import {numeral} from 'meteor/numeral:numeral';
import {lightbox} from 'meteor/theara:lightbox-helpers';

// Lib
import {tabularOpts} from '../../../core/common/libs/tabular-opts.js';

// Collection
import {Employee} from '../collections/employee.js';

// Page
Meteor.isClient && require('../../imports/pages/employee.html');

let tabularData = _.assignIn(_.clone(tabularOpts), {
    name: 'moto.employee',
    collection: Employee,
    columns: [
        {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Moto_employeeAction},
        {data: "_id", title: "ID"},
        {data: "name", title: "Name"},
        {data: "gender", title: "Gender"},
        {
            data: "startDate",
            title: "Start Date",
            render: function (val, type, doc) {
                return moment(val).format('DD/MM/YYYY');
            }
        },
        // {
        //     data: "dob",
        //     title: "Date of Birth",
        //     render: function (val, type, doc) {
        //         return moment(val).format('DD/MM/YYYY');
        //     }
        // },
        {data: "position", title: "Position"},
        {data: 'contact', title: 'Contact', tmpl: Meteor.isClient && Template.Moto_employeeContact},
    ],
    extraFields: ['address'],
});

export const EmployeeTabular = new Tabular.Table(tabularData);
