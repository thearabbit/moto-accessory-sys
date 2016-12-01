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
import {Customer} from '../collections/customer.js';

// Page
Meteor.isClient && require('../../imports/pages/customer.html');

let tabularData = _.assignIn(_.clone(tabularOpts), {
    name: 'moto.customer',
    collection: Customer,
    columns: [
        {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Moto_customerAction},
        {data: "_id", title: "ID"},
        {data: "name", title: "Name"},
        // {data: "gender", title: "Gender"},
        // {
        //     data: "dob",
        //     title: "Date of Birth",
        //     render: function (val, type, doc) {
        //         return moment(val).format('DD/MM/YYYY');
        //     }
        // },
        {
            data: "type",
            title: "Type",
            render: function (val, type, doc) {
                let result;

                if (val == "Retail") {
                    result = `<span class="badge bg-orange-active"><i class="fa fa-star-o"></i> ${val} </span>`;
                } else if (val == "Whole") {
                    result = `<span class="badge bg-teal-active"><i class="fa fa-star"></i> ${val} </span>`;
                } else {
                    result = `<span class="badge bg-navy-active"><i class="fa fa-trophy"></i> ${val} </span>`;
                }

                return result;
            }
        },
        {data: 'contact', title: 'Contact'},
    ],
});

export const CustomerTabular = new Tabular.Table(tabularData);
