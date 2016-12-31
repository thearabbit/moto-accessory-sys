import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {FlowRouterTitle} from 'meteor/ostrio:flow-router-title';
import 'meteor/arillo:flow-router-helpers';
import 'meteor/zimme:active-route';
import 'meteor/theara:flow-router-breadcrumb';

// Lib
import {__} from '../../core/common/libs/tapi18n-callback-helper.js';

// Layout
import {Layout} from '../../core/client/libs/render-layout.js';
import '../../core/imports/layouts/report/index.html';

// Group
let MotoRoutes = FlowRouter.group({
    prefix: '/moto',
    title: "Moto",
    titlePrefix: 'Moto > ',
    subscriptions: function (params, queryParams) {
        // Branch by user
        if (Meteor.user()) {
            let rolesBranch = Meteor.user().rolesBranch;
            this.register('core.branch', Meteor.subscribe('core.branch', {_id: {$in: rolesBranch}}));
        }
    }
});

// Item List
import '../imports/reports/itemList.js';
MotoRoutes.route('/item-list-report', {
    name: 'moto.itemListReport',
    title: 'Item List',
    action: function (params, queryParams) {
        Layout.main('Moto_itemListReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Item List',
        // icon: 'cart-plus',
        parent: 'moto.home'
    }
});

// Invoice
import '../imports/reports/invoice.js';
MotoRoutes.route('/invoice-report', {
    name: 'moto.invoiceReport',
    title: 'Invoice Report',
    action: function (params, queryParams) {
        Layout.main('Moto_invoiceReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Invoice Report',
        // icon: 'cart-plus',
        parent: 'moto.home'
    }
});

// Invoice
MotoRoutes.route('/invoice-report-gen', {
    name: 'moto.invoiceReportGe',
    title: 'Invoice',
    action: function (params, queryParams) {
        Layout.report('Moto_invoiceReportGen');
    }
});


// Invoice Vip
import '../imports/reports/invoiceVip.js';
MotoRoutes.route('/invoice-vip-report', {
    name: 'moto.invoiceVipReport',
    title: 'Invoice Vip Report',
    action: function (params, queryParams) {
        Layout.main('Moto_invoiceVipReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Invoice Vip Report',
        // icon: 'cart-plus',
        parent: 'moto.home'
    }
});

// Invoice Vip
MotoRoutes.route('/invoice-vip-report-gen', {
    name: 'moto.invoiceVipReportGe',
    title: 'Invoice Vip',
    action: function (params, queryParams) {
        Layout.report('Moto_invoiceVipReportGen');
    }
});

// Order
import '../imports/reports/order.js';
MotoRoutes.route('/order-report', {
    name: 'moto.orderReport',
    title: 'Order Report',
    action: function (params, queryParams) {
        Layout.main('Moto_orderReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Order Report',
        // icon: 'users',
        parent: 'moto.home'
    }
});

// Order By Customer
import '../imports/reports/orderByCustomer.js';
MotoRoutes.route('/orderByCustomer-report', {
    name: 'moto.orderByCustomerReport',
    title: 'Order By Customer Report',
    action: function (params, queryParams) {
        Layout.main('Moto_orderByCustomerReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Order By Customer Report',
        // icon: 'users',
        parent: 'moto.home'
    }
});
