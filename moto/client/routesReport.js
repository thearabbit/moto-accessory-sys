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

// Payment
import '../imports/reports/payment.js';
MotoRoutes.route('/payment-report', {
    name: 'moto.paymentReport',
    title: 'Payment Report',
    action: function (params, queryParams) {
        Layout.main('Moto_paymentReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Payment Report',
        // icon: 'users',
        parent: 'moto.home'
    }
});

// Payment Vip
import '../imports/reports/paymentVip.js';
MotoRoutes.route('/paymentVip-report', {
    name: 'moto.paymentVipReport',
    title: 'Payment Vip Report',
    action: function (params, queryParams) {
        Layout.main('Moto_paymentVipReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Payment Vip Report',
        // icon: 'users',
        parent: 'moto.home'
    }
});

// Order Vip
import '../imports/reports/orderVip.js';
MotoRoutes.route('/order-vip-report', {
    name: 'moto.orderVipReport',
    title: 'Order Vip Report',
    action: function (params, queryParams) {
        Layout.main('Moto_orderVipReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Order Vip Report',
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

// Order Vip By Customer
import '../imports/reports/orderVipByCustomer.js';
MotoRoutes.route('/orderVipByCustomer-report', {
    name: 'moto.orderVipByCustomerReport',
    title: 'Order Vip By Customer Report',
    action: function (params, queryParams) {
        Layout.main('Moto_orderVipByCustomerReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Order Vip By Customer Report',
        // icon: 'users',
        parent: 'moto.home'
    }
});

// OS Active Order
import '../imports/reports/activeOrder.js';
MotoRoutes.route('/activeOrder-report', {
    name: 'moto.activeOrderReport',
    title: 'Active Order Report',
    action: function (params, queryParams) {
        Layout.main('Moto_activeOrderReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Active Order Report',
        // icon: 'users',
        parent: 'moto.home'
    }
});

// OS Active Order Vip
import '../imports/reports/activeOrderVip.js';
MotoRoutes.route('/activeOrderVip-report', {
    name: 'moto.activeOrderVipReport',
    title: 'Active Order Vip Report',
    action: function (params, queryParams) {
        Layout.main('Moto_activeOrderVipReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Active Order Vip Report',
        // icon: 'users',
        parent: 'moto.home'
    }
});

// Customer Log
import '../imports/reports/customerLog.js';
MotoRoutes.route('/customerLog-report', {
    name: 'moto.customerLogReport',
    title: 'Customer Log Report',
    action: function (params, queryParams) {
        Layout.main('Moto_customerLogReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Customer Log Report',
        // icon: 'users',
        parent: 'moto.home'
    }
});

// Customer Log
import '../imports/reports/customerVipLog.js';
MotoRoutes.route('/customerVipLog-report', {
    name: 'moto.customerVipLogReport',
    title: 'Customer Vip Log Report',
    action: function (params, queryParams) {
        Layout.main('Moto_customerVipLogReport');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Customer Vip Log Report',
        // icon: 'users',
        parent: 'moto.home'
    }
});

