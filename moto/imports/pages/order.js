import {Template} from 'meteor/templating';
import {AutoForm} from 'meteor/aldeed:autoform';
import {Roles} from  'meteor/alanning:roles';
import {alertify} from 'meteor/ovcharik:alertifyjs';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {fa} from 'meteor/theara:fa-helpers';
import {lightbox} from 'meteor/theara:lightbox-helpers';
import {_} from 'meteor/erasaur:meteor-lodash';
import 'meteor/theara:jsonview';
import {TAPi18n} from 'meteor/tap:i18n';
import 'meteor/tap:i18n-ui';

// Lib
import {createNewAlertify} from '../../../core/client/libs/create-new-alertify.js';
import {renderTemplate} from '../../../core/client/libs/render-template.js';
import {destroyAction} from '../../../core/client/libs/destroy-action.js';
import {displaySuccess, displayError} from '../../../core/client/libs/display-alert.js';
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';

// Component
import '../../../core/client/components/loading.js';
import '../../../core/client/components/column-action.js';
import '../../../core/client/components/form-footer.js';

// Method
import {lookupOrder} from '../../common/methods/lookupOrder';
import {lookupOrderLog} from '../../common/methods/lookupOrderLog';

// Collection
import {Order} from '../../common/collections/order.js';
import {Exchange} from '../../../core/common/collections/exchange.js';
// import {Files} from '../../../core/common/collections/fiels.js';

// Tabular
import {OrderTabular} from '../../common/tabulars/order.js';

// Page
import './order.html';
import './orderItems.js';

// Declare template
let indexTmpl = Template.Moto_order,
    actionTmpl = Template.Moto_orderAction,
    formTmpl = Template.Moto_orderForm,
    showTmpl = Template.Moto_orderShow;

// Local collection
let itemsCollection = new Mongo.Collection(null);
// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('order', {size: 'lg'});
    createNewAlertify('orderShow');
});

indexTmpl.helpers({
    tabularTable(){
        return OrderTabular;
    },
    selector() {
        return {branchId: Session.get('currentBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.order(fa('plus', 'Order'), renderTemplate(formTmpl)).maximize();
    },
    'click .js-update' (event, instance) {
        alertify.order(fa('pencil', 'Order'), renderTemplate(formTmpl, {orderId: this._id})).maximize();
        Session.set("update", true);
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            Order,
            {_id: this._id},
            {title: 'Order', itemTitle: this._id}
        );
    },
    'click .js-display' (event, instance) {
        alertify.orderShow(fa('eye', 'Order'), renderTemplate(showTmpl, {orderId: this._id})).maximize();
    },
    'click .js-invoice' (event, instance) {
        let params = {};
        let queryParams = {orderId: this._id};
        let path = FlowRouter.path("moto.invoiceReportGe", params, queryParams);

        window.open(path, '_blank');
    },
    'click .js-payment' (event, instance) {
        let params = {
            orderId: this._id
        };
        FlowRouter.go("moto.orderPayment", params);
    }
});

// Form
formTmpl.onCreated(function () {
    let self = this;
    self.isLoading = new ReactiveVar(false);
    self.orderDoc = new ReactiveVar();
    self.orderLog = new ReactiveVar(0);

    Session.set('customerType', 'Retail');
    Session.set('discountType', 'Percentage');

    self.autorun(() => {
        // Lookup value
        this.subscribe('moto.lookupValue', ['Order Type', 'Discount Type']);

        let currentData = Template.currentData();
        if (currentData) {
            self.isLoading.set(true);

            lookupOrder.callPromise({
                orderId: currentData.orderId
            }).then((result) => {
                // Add items to local collection
                _.forEach(result.items, (value) => {
                    itemsCollection.insert(value);
                });

                self.orderDoc.set(result);
                self.isLoading.set(false);
            }).catch((err) => {
                console.log(err);
            });
        }

        this.subscribe('core.exchange');
        this.subscribe('files');
        this.subscribe('moto.customerForOrder');
    });
});

formTmpl.helpers({
    collection(){
        return Order;
    },
    isLoading(){
        return Template.instance().isLoading.get();
    },
    data () {
        let data = {
            formType: 'insert',
            doc: {}
        };

        let currentData = Template.currentData();
        if (currentData) {
            data.formType = 'update';
            data.doc = Template.instance().orderDoc.get();
            Session.set('discountAmountUpdate', data.doc.discountAmount);
        }

        return data;
    },
    itemsCollection(){
        return itemsCollection;
    },
    disabledSubmitBtn: function () {
        let count = itemsCollection.find().count();
        if (count == 0) {
            return {disabled: true};
        }

        return {};
    },
    showExchange(){
        let type = Session.get('customerType');
        return type == 'Whole' ? true : false;
    },
    showItems(){
        let result, exchange = Session.get('exchangeDoc'), type = Session.get('customerType');
        if (type == "Retail") {
            result = true;
        } else if (type == "Whole" && !_.isNull(exchange)) {
            result = true;
        } else {
            result = false;
        }
        return result;
    },
    image(){
        let result = "/no-image.png";
        if (Session.get("image")) {
            let photoUrl = Files.findOne({_id: Session.get("image")}).url();
            result = photoUrl;

        }
        return result;
    },
    orderLog(){
        let instance = Template.instance();
        return instance.orderLog.get();
    }
});

formTmpl.events({
    'click [name="type"]': function (event, instance) {
        let type = event.currentTarget.value;
        Session.set('customerType', type);
        Session.set('exchangeDoc', null);
        itemsCollection.remove({});
    },
    'click [name="discountType"]': function (event, instance) {
        let discountType = event.currentTarget.value;
        Session.set('discountType', discountType);
    },
    'change [name="exchangeId"]': function (event, instance) {
        let exchangeId = event.currentTarget.value;
        let exchange = Exchange.findOne({_id: exchangeId});
        Session.set('exchangeDoc', exchange);
    },
    'change [name="customerId"]': function (event, instance) {
        let customerId = event.currentTarget.value;

        lookupOrderLog.callPromise({
            customerId: customerId
        }).then((result) => {
            instance.orderLog.set(result || 0);
        }).catch((err) => {
            console.log(err);
        });
    }
});

formTmpl.onDestroyed(function () {
    // Remove items collection
    itemsCollection.remove({});
    Session.set('customerType', null);
    Session.set('exchangeDoc', null);
    Session.set('discountType', null);
    Session.set('update', false);
    Session.set('discountAmountUpdate', null);
    Session.set('image', null);
});

// Show
showTmpl.onCreated(function () {
    this.orderDoc = new ReactiveVar();

    this.autorun(() => {
        $.blockUI();

        let currentData = Template.currentData();
        lookupOrder.callPromise({
            orderId: currentData.orderId
        }).then((result) => {
            console.log(result);
            this.orderDoc.set(result);

            $.unblockUI();
        }).catch((err) => {
            console.log(err);
        });
    });
});

showTmpl.helpers({
    data () {
        let data = Template.instance().orderDoc.get();

        if (data && data.des) {
            data.des = Spacebars.SafeString(data.des);
        }

        return data;
    },
    checkDiscountType() {
        let data = Template.instance().orderDoc.get();
        let result = {
            class: 'label bg-red',
            icon: fa("percent", "Percentage")
        };

        if (data && data.discountType == "Amount") {
            result = {
                class: 'label bg-green',
                icon: fa("money", "Amount")
            };
        }

        return result;
    },
    checkType() {
        let data = Template.instance().orderDoc.get();
        let result = {
            class: 'label bg-teal-active',
            icon: fa("star", "Whole")
        };

        if (data && data.type == "Retail") {
            result = {
                class: 'label bg-orange',
                icon: fa("star-o", "Retail")
            };
        }

        return result;
    },
    jsonViewOpts(){
        return {collapsed: true};
    }
});

// Hook
let hooksObject = {
    before: {
        insert: function (doc) {
            doc.items = itemsCollection.find().fetch();
            return doc;
        },
        update: function (doc) {
            doc.$set.items = itemsCollection.find().fetch();

            delete doc.$unset;

            return doc;
        }
    },
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.order().close();
        }
        // Remove items collection
        itemsCollection.remove({});
        $('[name="itemId"]').val(null).trigger('change');
        $('[name="qty"]').val(null);
        $('[name="price"]').val(null);
        $('[name="amount"]').val(null);
        $('[name="discountAmount"]').val(null);
        $('[name="total"]').val(null);

        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Moto_orderForm'], hooksObject);
