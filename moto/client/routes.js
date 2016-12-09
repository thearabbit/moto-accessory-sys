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
import '../../core/imports/layouts/login';
import '../../core/imports/layouts/main';

// Group
let MotoRoutes = FlowRouter.group({
    prefix: '/moto',
    title: "Moto",
    titlePrefix: 'Moto > ',
    subscriptions: function (params, queryParams) {
//     this.register('files', Meteor.subscribe('files'));
    }
});

// Home
import '../imports/pages/home.js';
MotoRoutes.route('/home', {
    name: 'moto.home',
    title: __('moto.home.title'),
    action(param, queryParam){
        Layout.main('Moto_home');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: __('moto.home.title'),
        icon: 'home',
        parent: 'core.welcome'
    }
});

// Lookup Value
import '../imports/pages/lookupValue.js';
MotoRoutes.route('/lookup-value', {
    name: 'moto.lookupValue',
    title: 'Lookup Value',
    action: function (params, queryParams) {
        Layout.main('Moto_lookupValue');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Lookup Value',
        // icon: 'asterisk',
        parent: 'moto.home'
    }
});

// Location
import '../imports/pages/location.js';
MotoRoutes.route('/location', {
    name: 'moto.location',
    title: 'Location',
    action: function (params, queryParams) {
        Layout.main('Moto_location');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Location',
        // icon: 'product-hunt',
        parent: 'moto.home'
    }
});

// Item
import '../imports/pages/item.js';
MotoRoutes.route('/item', {
    name: 'moto.item',
    title: __('moto.item.title'),
    action: function (params, queryParams) {
        Layout.main('Moto_item');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: __('moto.item.title'),
        // icon: 'product-hunt',
        parent: 'moto.home'
    }
});

// Employee
import '../imports/pages/employee.js';
MotoRoutes.route('/employee', {
    name: 'moto.employee',
    title: __('moto.employee.title'),
    action: function (params, queryParams) {
        Layout.main('Moto_employee');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: __('moto.employee.title'),
        // icon: 'product-hunt',
        parent: 'moto.home'
    }
});

// Supplier
import '../imports/pages/supplier.js';
MotoRoutes.route('/supplier', {
    name: 'moto.supplier',
    title: __('moto.supplier.title'),
    action: function (params, queryParams) {
        Layout.main('Moto_supplier');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: __('moto.supplier.title'),
        // icon: 'product-hunt',
        parent: 'moto.home'
    }
});

// Customer
import '../imports/pages/customer.js';
MotoRoutes.route('/customer', {
    name: 'moto.customer',
    title: 'Customer',
    action: function (params, queryParams) {
        Layout.main('Moto_customer');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Customer',
        // icon: 'users',
        parent: 'moto.home'
    }
});

// Order
import '../imports/pages/order.js';
MotoRoutes.route('/order', {
    name: 'moto.order',
    title: 'Order',
    action: function (params, queryParams) {
        Layout.main('Moto_order');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Order',
        // icon: 'cart-plus',
        parent: 'moto.home'
    }
});

//Order Payment
import '../imports/pages/orderPayment.js';
MotoRoutes.route('/orderPayment/:orderId?', {
    name: 'moto.orderPayment',
    title: 'Order Payment',
    action: function (params, queryParams) {
        Layout.main('Moto_orderPayment');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Order Payment',
        // icon: 'tags',
        parent: 'moto.order'
    }
});

// Order Vip
import '../imports/pages/orderVip.js';
MotoRoutes.route('/orderVip', {
    name: 'moto.orderVip',
    title: 'Order VIP',
    action: function (params, queryParams) {
        Layout.main('Moto_orderVip');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: 'Order VIP',
        // icon: 'cart-plus',
        parent: 'moto.home'
    }
});

// Unit
import '../imports/pages/unit.js';
MotoRoutes.route('/unit', {
    name: 'moto.unit',
    title: __('moto.unit.title'),
    action: function (params, queryParams) {
        Layout.main('Moto_unit');
    },
    breadcrumb: {
        //params: ['id'],
        //queryParams: ['show', 'color'],
        title: __('moto.unit.title'),
        // icon: 'product-hunt',
        parent: 'moto.home'
    }
});