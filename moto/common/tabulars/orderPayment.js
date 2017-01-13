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
import {OrderPayment} from '../collections/orderPayment.js';

// Page
Meteor.isClient && require('../../imports/pages/orderPayment.html');

let tabularData = _.assignIn(_.clone(tabularOpts), {
    name: 'moto.orderPayment',
    collection: OrderPayment,
    columns: [
        {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Moto_orderPaymentAction},
        {data: "_id", title: "ID"},
        {data: "orderId", title: "Order Id"},
        {
            data: "paidDate",
            title: "Paid Date",
            render: function (val, type, doc) {
                return moment(val).format('DD/MM/YYYY hh:mm:ss');
            }
        },
        {data: "customerId", title: "Customer"},
        {
            data: "dueAmount",
            title: "Due Amount",
            render(val, type, doc){
                return `${val} ៛`;
            }
        },
        {
            data: "paidAmount",
            title: "Paid Amount",
            render(val, type, doc){
                return `${val} ៛`;
            }
        },
        {
            data: "balance",
            title: "Balance",
            render(val, type, doc){
                return `${val} ៛`;
            }
        },
        {
            data: "status", title: "Status",
            render(val, type, doc){
                if (val == "Partial") {
                    return `<span class="badge bg-orange-active"><i class="fa fa-heart-o"></i> ${val} </span>`;
                } else if (val == "Overpaid") {
                    return `<span class="badge bg-green"><i class="fa fa-thumbs-up"></i> ${val} </span>`;
                } else {
                    return `<span class="badge bg-teal-active"><i class="fa fa-heart"></i> ${val} </span>`;
                }
            }
        }],
    extraFields: ['employeeId', 'printId']
});

export const OrderPaymentTabular = new Tabular.Table(tabularData);
