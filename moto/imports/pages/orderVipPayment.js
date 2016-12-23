import {Template} from 'meteor/templating';
import {AutoForm} from 'meteor/aldeed:autoform';
import {Roles} from  'meteor/alanning:roles';
import {alertify} from 'meteor/ovcharik:alertifyjs';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {fa} from 'meteor/theara:fa-helpers';
import {lightbox} from 'meteor/theara:lightbox-helpers';
import {TAPi18n} from 'meteor/tap:i18n';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';
import {moment} from 'meteor/momentjs:moment';
// import {$} from 'meteor/jquery';

// Lib
import {createNewAlertify} from '../../../core/client/libs/create-new-alertify.js';
import {reactiveTableSettings} from '../../../core/client/libs/reactive-table-settings.js';
import {renderTemplate} from '../../../core/client/libs/render-template.js';
import {destroyAction} from '../../../core/client/libs/destroy-action.js';
import {displaySuccess, displayError} from '../../../core/client/libs/display-alert.js';
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';

// Component
import '../../../core/client/components/loading.js';
import '../../../core/client/components/column-action.js';
import '../../../core/client/components/form-footer.js';

// Collection
import {OrderVipPayment} from '../../common/collections/orderVipPayment.js';

// Tabular
import {OrderPaymentTabular} from '../../common/tabulars/orderVipPayment.js';

// Page
import './orderVipPayment.html';

// Method
import {lookupOrderVipPayment} from '../../common/methods/lookupOrderVipPayment';

// Declare template
let indexTmpl = Template.Moto_orderVipPayment,
    formTmpl = Template.Moto_orderVipPaymentForm,
    showTmpl = Template.Moto_orderVipPaymentShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('orderVipPayment', {size: 'lg'});
    createNewAlertify('orderVipPaymentShow',);
});

indexTmpl.helpers({
    tabularTable(){
        return OrderPaymentTabular;
    },
    selector() {
        return {branchId: Session.get('currentByBranch'), orderVipId: FlowRouter.getParam("orderVipId")};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.orderVipPayment(fa('plus', 'Order Vip Payment'), renderTemplate(formTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.orderVipPayment(fa('pencil', 'Order Vip Payment'), renderTemplate(formTmpl, {orderVipPaymentId: this._id}));
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            OrderVipPayment,
            {_id: this._id},
            {title: 'Order Vip Payment', itemTitle: this._id}
        );
    },
    'click .js-display' (event, instance) {
        alertify.orderVipPaymentShow(fa('eye', 'Order Vip Payment'), renderTemplate(showTmpl, {orderVipPaymentId: this._id}));
    }
});

// Form
formTmpl.onCreated(function () {
    this.autorun(()=> {
        // Lookup value
        this.subscribe('moto.lookupValue', ['Gender', 'Contact Type', 'OrderVipPayment Type']);

        let currentData = Template.currentData();
        if (currentData) {
            this.subscribe('moto.orderVipPaymentById', currentData.orderVipPaymentId);
        }
    });

    let self = this;
    self.paymentVipDoc = new ReactiveVar(0);
    self.dueAmountKhr = new ReactiveVar(0);
    self.paidAmountKhr = new ReactiveVar(0);
    self.dueAmountUsd = new ReactiveVar(0);
    self.paidAmountUsd = new ReactiveVar(0);
    self.dueAmountThb = new ReactiveVar(0);
    self.paidAmountThb = new ReactiveVar(0);

    self.autorun(()=> {
        let orderVipId = FlowRouter.getParam("orderVipId");

        if (orderVipId) {
            lookupOrderVipPayment.callPromise({
                orderVipId: orderVipId
            }).then((result)=> {
                self.dueAmountKhr.set(result.paymentVip.balanceKhr || result.paymentVip.paymentBalanceKhr);
                self.dueAmountUsd.set(result.paymentVip.balanceUsd || result.paymentVip.paymentBalanceUsd);
                self.dueAmountThb.set(result.paymentVip.balanceThb || result.paymentVip.paymentBalanceThb);
                self.paymentVipDoc.set(result);
            }).catch((err)=> {
                console.log(err);
            });
        }

    });

});

formTmpl.helpers({
    collection(){
        return OrderVipPayment;
    },
    data () {
        let paymentVipDoc = Template.instance().paymentVipDoc.get();

        let data = {
            formType: 'insert',
            doc: {
                orderVipId: paymentVipDoc._id,
                customerId: paymentVipDoc.customerId,
                dueAmountKhr: paymentVipDoc.paymentVip.balanceKhr || paymentVipDoc.paymentVip.paymentBalanceKhr,
                dueAmountUsd: paymentVipDoc.paymentVip.balanceUsd || paymentVipDoc.paymentVip.paymentBalanceUsd,
                dueAmountThb: paymentVipDoc.paymentVip.balanceThb || paymentVipDoc.paymentVip.paymentBalanceThb,
                paidDate: moment().toDate()
            }
        };
        let currentData = Template.currentData();

        if (currentData) {
            data.formType = 'update';
            data.doc = OrderVipPayment.findOne(currentData.orderVipPaymentId);
            Template.instance().dueAmountKhr.set(data.doc.dueAmountKhr);
            Template.instance().paidAmountKhr.set(data.doc.paidAmountKhr);
            Template.instance().dueAmountUsd.set(data.doc.dueAmountUsd);
            Template.instance().paidAmountUsd.set(data.doc.paidAmountUsd);
            Template.instance().dueAmountThb.set(data.doc.dueAmountThb);
            Template.instance().paidAmountThb.set(data.doc.paidAmountThb);
        }

        return data;
    },
    paymentBalanceKhr (){
        let instance = Template.instance();
        let dueAmountKhr = instance.dueAmountKhr.get();
        let paidAmountKhr = instance.paidAmountKhr.get();

        return dueAmountKhr - paidAmountKhr;
    },
    paymentBalanceUsd(){
        let instance = Template.instance();
        let dueAmountUsd = instance.dueAmountUsd.get();
        let paidAmountUsd = instance.paidAmountUsd.get();

        return dueAmountUsd - paidAmountUsd;
    },
    paymentBalanceThb(){
        let instance = Template.instance();
        let dueAmountThb = instance.dueAmountThb.get();
        let paidAmountThb = instance.paidAmountThb.get();

        return dueAmountThb - paidAmountThb;
    }
});

formTmpl.events({
    'keyup [name="paidAmountKhr"]'(event, instance){
        let paidAmountKhr = event.currentTarget.value;
        instance.paidAmountKhr.set(paidAmountKhr);
    },
    'keyup [name="paidAmountUsd"]'(event, instance){
        let paidAmountUsd = event.currentTarget.value;
        instance.paidAmountUsd.set(paidAmountUsd);
    },
    'keyup [name="paidAmountThb"]'(event, instance){
        let paidAmountThb = event.currentTarget.value;
        instance.paidAmountThb.set(paidAmountThb);
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        let currentData = Template.currentData();
        this.subscribe('moto.orderVipPaymentById', currentData.orderVipPaymentId);
    });
});

showTmpl.helpers({
    data () {
        let currentData = Template.currentData();
        return OrderVipPayment.findOne(currentData.orderVipPaymentId);
    },
    jsonViewOpts () {
        return {collapsed: true};
    }
});

// Hook
let hooksObject = {
    onSuccess (formType, result) {
        // if (formType == 'update') {
            alertify.orderVipPayment().close();
        // }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Moto_orderVipPaymentForm'], hooksObject);
