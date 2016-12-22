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
import {round2} from 'meteor/theara:round2';

// Lib
import {createNewAlertify} from '../../../core/client/libs/create-new-alertify.js';
import {renderTemplate} from '../../../core/client/libs/render-template.js';
import {destroyAction} from '../../../core/client/libs/destroy-action.js';
import {displaySuccess, displayError} from '../../../core/client/libs/display-alert.js';
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';
import {roundKhrCurrency}  from '../../../moto/common/libs/roundKhrCurrency';

// Component
import '../../../core/client/components/loading.js';
import '../../../core/client/components/column-action.js';
import '../../../core/client/components/form-footer.js';

// Method
import {lookupOrderVip} from '../../common/methods/lookupOrderVip';
import {lookupOrderVipLog} from '../../common/methods/lookupOrderVipLog';

// Collection
import {OrderVip} from '../../common/collections/orderVip.js';
import {Exchange} from '../../../core/common/collections/exchange.js';

// Tabular
import {OrderVipTabular} from '../../common/tabulars/orderVip.js';

// Page
import './orderVip.html';
import './orderVipItems.js';

// Declare template
let indexTmpl = Template.Moto_orderVip,
    actionTmpl = Template.Moto_orderVipAction,
    formTmpl = Template.Moto_orderVipForm,
    showTmpl = Template.Moto_orderVipShow;

// Local collection
let itemsCollection = new Mongo.Collection(null);
// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('order', {size: 'lg'});
    createNewAlertify('orderShow',);
});

indexTmpl.helpers({
    tabularTable(){
        return OrderVipTabular;
    },
    selector() {
        return {branchId: Session.get('currentBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.order(fa('plus', 'Order Vip'), renderTemplate(formTmpl)).maximize();
    },
    'click .js-update' (event, instance) {
        alertify.order(fa('pencil', 'Order Vip'), renderTemplate(formTmpl, {orderVipId: this._id})).maximize();
        Session.set("update", true);
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            OrderVip,
            {_id: this._id},
            {title: 'Order Vip', itemTitle: this._id}
        );
    },
    'click .js-display' (event, instance) {
        alertify.orderShow(fa('eye', 'Order Vip'), renderTemplate(showTmpl, {orderVipId: this._id})).maximize();
    },
    'click .js-invoice' (event, instance) {
        let params = {};
        let queryParams = {orderVipId: this._id};
        let path = FlowRouter.path("moto.invoiceVipReportGe", params, queryParams);

        window.open(path, '_blank');
    },
    'click .js-paymentVip' (event, instance) {
        let params = {
            orderVipId: this._id
        };
        FlowRouter.go("moto.orderVipPayment", params);
    }
});

// Form
formTmpl.onCreated(function () {
    let self = this;
    self.isLoading = new ReactiveVar(false);
    self.orderVipDoc = new ReactiveVar();
    self.orderVipLog = new ReactiveVar(0);
    Session.set('customerType', 'Vip');
    if (!Template.currentData()) {
        Session.set('discountType', 'Percentage');
    }
    self.lastOrderBalanceKhr = new ReactiveVar(0);
    self.lastOrderBalanceUsd = new ReactiveVar(0);
    self.lastOrderBalanceThb = new ReactiveVar(0);

    self.autorun(() => {
        // Lookup value
        this.subscribe('moto.lookupValue', ['Order Type', 'Discount Type']);

        let currentData = Template.currentData();
        if (currentData) {
            self.isLoading.set(true);

            lookupOrderVip.callPromise({
                orderVipId: currentData.orderVipId
            }).then((result) => {
                // Add items to local collection
                _.forEach(result.items, (value) => {
                    itemsCollection.insert(value);
                });
                self.lastOrderBalanceKhr.set(result.lastOrderBalanceKhr);
                self.lastOrderBalanceUsd.set(result.lastOrderBalanceUsd);
                self.lastOrderBalanceThb.set(result.lastOrderBalanceThb);
                self.orderVipDoc.set(result);
                self.isLoading.set(false);
            }).catch((err) => {
                console.log(err);
            });
        }

        this.subscribe('core.exchange');
    });
});

formTmpl.helpers({
    collection(){
        return OrderVip;
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

            data.doc = Template.instance().orderVipDoc.get();

            Session.set('discountAmountUpdate', data.doc.discountAmount);
            Session.set('discountAmountUsdUpdate', data.doc.discountAmountUsd);
            Session.set('discountAmountThbUpdate', data.doc.discountAmountThb);
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
    image(){
        let result = "/no-image.png";
        if (Session.get("image")) {
            let photoUrl = Files.findOne({_id: Session.get("image")}).url();
            result = photoUrl;

        }
        return result;
    },
    orderVipLog(){
        let instance = Template.instance();
        return instance.orderVipLog.get();
    },
    lastOrderBalanceKhr(){
        let instance = Template.instance();
        let lastOrderBalanceKhr = _.isUndefined(instance.lastOrderBalanceKhr.get()) ? 0 : instance.lastOrderBalanceKhr.get();
        return roundKhrCurrency(lastOrderBalanceKhr);
    },
    lastOrderBalanceUsd(){
        let instance = Template.instance();
        let lastOrderBalanceUsd = _.isUndefined(instance.lastOrderBalanceUsd.get()) ? 0 : instance.lastOrderBalanceUsd.get();
        return round2(lastOrderBalanceUsd, 2);
    },
    lastOrderBalanceThb(){
        let instance = Template.instance();
        let lastOrderBalanceThb = _.isUndefined(instance.lastOrderBalanceThb.get()) ? 0 : instance.lastOrderBalanceThb.get();
        return round2(lastOrderBalanceThb, 2);
    }
});

formTmpl.events({
    'click [name="type"]': function (event, instance) {
        let type = event.currentTarget.value;
        Session.set('customerType', type);
        Session.set('exchangeDoc', null);
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
        let currentData = Template.currentData();

        lookupOrderVipLog.callPromise({
            customerId: customerId
        }).then((result) => {
            // instance.orderVipLog.set(result || 0);
            let data = result;
            if (_.isUndefined(result)) {
                data = 0;
            }

            if (currentData && customerId == "") {
                instance.lastOrderBalanceKhr.set(instance.orderVipDoc.get().lastOrderBalanceKhr);
                instance.lastOrderBalanceUsd.set(instance.orderVipDoc.get().lastOrderBalanceUsd);
                instance.lastOrderBalanceThb.set(instance.orderVipDoc.get().lastOrderBalanceThb);
            } else if (currentData && instance.orderVipDoc.get().customerId == customerId) {
                instance.lastOrderBalanceKhr.set(instance.orderVipDoc.get().lastOrderBalanceKhr);
                instance.lastOrderBalanceUsd.set(instance.orderVipDoc.get().lastOrderBalanceUsd);
                instance.lastOrderBalanceThb.set(instance.orderVipDoc.get().lastOrderBalanceThb);
            }
            else {
                instance.lastOrderBalanceKhr.set(data.totalOrderVipLogKhr);
                instance.lastOrderBalanceUsd.set(data.totalOrderVipLogUsd);
                instance.lastOrderBalanceThb.set(data.totalOrderVipLogThb);
            }

            instance.orderVipLog.set(data);
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
    Session.set('discountAmountUsdUpdate', null);
    Session.set('discountAmountThbUpdate', null);
    Session.set('image', null);
});

// Show
showTmpl.onCreated(function () {
    this.orderVipDoc = new ReactiveVar();

    this.autorun(() => {
        $.blockUI();

        let currentData = Template.currentData();
        lookupOrderVip.callPromise({
            orderVipId: currentData.orderVipId
        }).then((result) => {
            this.orderVipDoc.set(result);

            $.unblockUI();
        }).catch((err) => {
            console.log(err);
        });
    });
});

showTmpl.helpers({
    data () {
        let data = Template.instance().orderVipDoc.get();

        if (data && data.des) {
            data.des = Spacebars.SafeString(data.des);
        }

        return data;
    },
    checkDiscountType() {
        let data = Template.instance().orderVipDoc.get();
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
        $('[name="discountAmountUsd"]').val(null);
        $('[name="totalUsd"]').val(null);
        $('[name="discountAmountThb"]').val(null);
        $('[name="totalThb"]').val(null);

        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Moto_orderVipForm'], hooksObject);
