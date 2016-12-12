import {Meteor} from 'meteor/meteor';
import {Templet} from 'meteor/templating';
import Tabular from 'meteor/aldeed:tabular';
import {EJSON} from 'meteor/ejson';
import {moment} from 'meteor/momentjs:moment';
import {_} from 'meteor/erasaur:meteor-lodash';
import {numeral} from 'meteor/numeral:numeral';
import {lightbox} from 'meteor/theara:lightbox-helpers';

// Lib
import {tabularOpts} from '../../../core/common/libs/tabular-opts.js';

// Collection
import {OrderVip} from '../collections/orderVip.js';

// Page
Meteor.isClient && require('../../imports/pages/orderVip.html');

let tabularData = _.assignIn(_.clone(tabularOpts), {
    name: 'moto.orderVip',
    collection: OrderVip,
    columns: [
        {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Moto_orderVipAction},
        {data: "_id", title: "ID"},
        {
            data: "orderDate",
            title: "Date",
            render: function (val, type, doc) {
                return moment(val).format('DD/MM/YYYY hh:mm:ss');
            }
        },
        {data: "customerId", title: "Customer"},
        {
            data: "subTotal",
            title: "SubTotal",
            render: function (val, type, doc) {
                let result = `KHR : ${val} <br> USD : ${doc.subTotalUsd} <br> THB : ${doc.subTotalThb}`;
                return result;
            }
        },
        {
            data: "discountAmount",
            title: "Discount Amount",
            render: function (val, type, doc) {
                let result = `KHR : ${val} <br> USD : ${doc.discountAmountUsd} <br> THB : ${doc.discountAmountThb}`;
                return result;
            }
        },
        {
            data: "total",
            title: "Total",
            render: function (val, type, doc) {
                let result = `KHR : ${val} <br> USD : ${doc.totalUsd} <br> THB : ${doc.totalThb}`;
                return result;
            }
        },
        {data: "des", title: "Description"},
        {
            data: "type",
            title: "Type",
            render(val, type, doc){
                return `<span class="badge bg-navy-active"><i class="fa fa-trophy"></i> ${val} </span>`;
            }
        },
        {
            title: "Payment",
            tmpl: Meteor.isClient && Template.Moto_paymentVipLinkAction
        }
    ],
    extraFields: ['employeeId', 'discountType', 'items', 'subTotalUsd', 'discountAmountUsd', 'totalUsd','subTotalThb', 'discountAmountThb', 'totalThb']
});

export const OrderVipTabular = new Tabular.Table(tabularData);
