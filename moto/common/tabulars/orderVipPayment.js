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
import {OrderVipPayment} from '../collections/orderVipPayment.js';

// Page
Meteor.isClient && require('../../imports/pages/orderVipPayment.html');

let tabularData = _.assignIn(_.clone(tabularOpts), {
    name: 'moto.orderVipPayment',
    collection: OrderVipPayment,
    columns: [
        {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Moto_orderVipPaymentAction},
        {data: "_id", title: "ID"},
        {data: "orderVipId", title: "Order Vip Id"},
        {
            data: "paidDate",
            title: "Paid Date",
            render: function (val, type, doc) {
                return moment(val).format('DD/MM/YYYY hh:mm:ss');
            }
        },
        {
            data: "dueAmountKhr",
            title: "Due Amount",
            render(val, type, doc){
                return `KHR : ${val} ៛ <br> 
                         USD : ${doc.dueAmountUsd} $<br>
                         THB : ${doc.dueAmountThb} B`;
            }
        },
        {
            data: "paidAmountKhr",
            title: "Paid Amount",
            render(val, type, doc){
                return `KHR : ${val} ៛ <br> 
                         USD : ${doc.paidAmountUsd} $<br>
                         THB : ${doc.paidAmountThb} B`;
            }
        },
        {
            data: "paymentBalanceKhr",
            title: "Balance",
            render(val, type, doc){
                return `KHR : ${val} ៛ <br> 
                         USD : ${doc.paymentBalanceUsd} $<br>
                         THB : ${doc.paymentBalanceThb} B`;
            }
        },
        {
            data: "status", title: "Status",
            render(val, type, doc){
                if (val == "Partial") {
                    return `<span class="badge bg-orange-active"><i class="fa fa-heart-o"></i> ${val} </span>`;
                }
                return `<span class="badge bg-teal-active"><i class="fa fa-heart"></i> ${val} </span>`;
            }
        }],
    extraFields: ['customerId', 'employeeId', 'dueAmountUsd', 'dueAmountThb', 'paidAmountUsd', 'paidAmountThb' , 'paymentBalanceUsd' ,'paymentBalanceThb']
});

export const OrderPaymentTabular = new Tabular.Table(tabularData);
