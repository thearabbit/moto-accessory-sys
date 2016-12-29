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
import {Order} from '../collections/order.js';

// Page
Meteor.isClient && require('../../imports/pages/order.html');

let tabularData = _.assignIn(_.clone(tabularOpts), {
    name: 'moto.order',
    collection: Order,
    columns: [
        {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Moto_orderAction},
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
            render(val, type, doc){
                return `${val} ៛`;
            }
        },
        {
            data: "discountAmount",
            title: "Discount Amount",
            render(val, type, doc){
                return `${val} ៛`;
            }
        },
        {
            data: "total",
            title: "Total",
            render(val, type, doc){
                return `${val} ៛`;
            }
        },
        {
            data: "lastOrderBalance",
            title: "Last Order Balance",
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
            data: "type",
            title: "Type",
            render(val, type, doc){
                if (val == "Retail") {
                    return `<span class="badge bg-orange-active"><i class="fa fa-star-o"></i> ${val} </span>`;
                }
                return `<span class="badge bg-teal-active"><i class="fa fa-star"></i> ${val} </span>`;
            }
        },
        {
            title: "Payment",
            tmpl: Meteor.isClient && Template.Moto_paymentLinkAction
        }
    ],
    extraFields:['employeeId','items','exchangeId']
});

export const OrderTabular = new Tabular.Table(tabularData);
