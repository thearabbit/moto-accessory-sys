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
        {data: "_customer.name", title: "Customer"},
        // {
        //     data: "subTotal",
        //     title: "SubTotal",
        //     render: function (val, type, doc) {
        //         let result = `KHR : ${val} <br> USD : ${doc.subTotalUsd} <br> THB : ${doc.subTotalThb}`;
        //         return result;
        //     }
        // },
        // {
        //     data: "discountAmount",
        //     title: "Discount Amount",
        //     render: function (val, type, doc) {
        //         let result = `KHR : ${val} <br> USD : ${doc.discountAmountUsd} <br> THB : ${doc.discountAmountThb}`;
        //         return result;
        //     }
        // },
        {
            data: "total",
            title: "Total",
            render: function (val, type, doc) {
                let result = `KHR : ${val} <br> USD : ${doc.totalUsd} <br> THB : ${doc.totalThb}`;
                return result;
            }
        },
        {
            data: "lastOrderBalanceKhr",
            title: "Last Order Balance",
            render: function (val, type, doc) {
                let result = `KHR : ${val} <br> USD : ${doc.lastOrderBalanceUsd} <br> THB : ${doc.lastOrderBalanceThb}`;
                return result;
            }
        },
        {
            data: "balanceKhr",
            title: "Balance",
            render: function (val, type, doc) {
                let result = `KHR : ${val} <br> USD : ${doc.balanceUsd} <br> THB : ${doc.balanceThb}`;
                return result;
            }
        },
        {
            title: "Payment",
            tmpl: Meteor.isClient && Template.Moto_paymentVipLinkAction
        }
    ],
    extraFields: ['customerId', 'employeeId', 'items', 'subTotalUsd', 'discountAmount', 'discountAmountUsd', 'total', 'totalUsd', 'subTotalThb', 'discountAmountThb', 'totalThb', 'lastOrderBalanceUsd', 'lastOrderBalanceThb', 'balanceUsd', 'balanceThb']
});

export const OrderVipTabular = new Tabular.Table(tabularData);
