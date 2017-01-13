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
import {roundKhrCurrency}  from '../../../moto/common/libs/roundKhrCurrency';

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
    createNewAlertify('orderVipInvoice', {size: 'lg'});
    createNewAlertify('orderVipPaymentShow');
});

indexTmpl.helpers({
    tabularTable(){
        return OrderPaymentTabular;
    },
    selector() {
        return {
            branchId: Session.get('currentByBranch'),
            customerId: FlowRouter.getParam("customerId"),
            orderVipId: FlowRouter.getParam("orderVipId")
        };
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.orderVipPayment(fa('plus', 'Order Vip Payment'), renderTemplate(formTmpl));
    },
    'click .js-update' (event, instance) {
        if (checkLastOrderVipPayment(this.customerId) == this._id) {
            alertify.orderVipPayment(fa('pencil', 'Order Vip Payment'), renderTemplate(formTmpl, {orderVipPaymentId: this._id}));
        } else {
            swal({
                title: "Information",
                type: "info",
                text: "You can edit the last record only !",
                timer: 2200,
                showConfirmButton: false
            });
        }
    },
    'click .js-destroy' (event, instance) {
        if (checkLastOrderVipPayment(this.customerId) == this._id) {
            destroyAction(
                OrderVipPayment,
                {_id: this._id},
                {title: 'Order Vip Payment', itemTitle: this._id}
            );
        } else {
            swal({
                title: "Information",
                type: "info",
                text: "You can delete the last record only !",
                timer: 2200,
                showConfirmButton: false
            });
        }
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
    self.dueAmountKhr = new ReactiveVar();
    self.paidAmountKhr = new ReactiveVar(0);
    self.dueAmountUsd = new ReactiveVar();
    self.paidAmountUsd = new ReactiveVar(0);
    self.dueAmountThb = new ReactiveVar();
    self.paidAmountThb = new ReactiveVar(0);
    self.customerId = new ReactiveVar();

    // note : we use $('[name="customerId"]').val() when update because Session not work well
    self.autorun(()=> {
        let customerId = Template.instance().customerId.get() || Session.get('customerIdForSaveAndPayment') || $('[name="customerId"]').val();

        if (customerId) {
            lookupOrderVipPayment.callPromise({
                customerId: customerId
            }).then((result)=> {
                if (!_.isUndefined(result)) {
                    self.dueAmountKhr.set(result.paymentVip.balanceKhr || result.paymentVip.paymentBalanceKhr);
                    self.dueAmountUsd.set(result.paymentVip.balanceUsd || result.paymentVip.paymentBalanceUsd);
                    self.dueAmountThb.set(result.paymentVip.balanceThb || result.paymentVip.paymentBalanceThb);
                }
                else {
                    self.dueAmountKhr.set(0);
                    self.dueAmountUsd.set(0);
                    self.dueAmountThb.set(0);
                }

                if (result.printId) {
                    Session.set('printId', result.printId);
                }

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
    schema(){
        // note : we use $(".customerId").val() when update because Session not work well
        if (Session.get('customerIdForSaveAndPayment') || $(".customerId").val()) {
            return OrderVipPayment.ForSaveAndPaymentSchema;
        } else {
            return OrderVipPayment.schema;
        }
    },
    data () {
        let paymentVipDoc = Template.instance().paymentVipDoc.get();
        let dueAmountKhr = Template.instance().dueAmountKhr.get();
        let dueAmountUsd = Template.instance().dueAmountUsd.get();
        let dueAmountThb = Template.instance().dueAmountThb.get();
        let customerId = Template.instance().customerId.get();

        let data = {
            formType: 'insert',
            doc: {
                orderVipId: _.isUndefined(paymentVipDoc) ? 404 : paymentVipDoc._id,
                dueAmountKhr: roundKhrCurrency(dueAmountKhr),
                dueAmountUsd: dueAmountUsd,
                dueAmountThb: dueAmountThb,
                paidDate: moment().toDate(),
                printId: _.isUndefined(paymentVipDoc) ? 404 : paymentVipDoc.printId
            }
        };
        let currentData = Template.currentData();

        if (currentData) {
            data.formType = 'update';
            data.doc = OrderVipPayment.findOne(currentData.orderVipPaymentId);

            if (data.doc.dueAmountKhr && _.isUndefined(dueAmountKhr)) {
                data.doc.dueAmountKhr = data.doc.dueAmountKhr;
            }
            else if (FlowRouter.getParam("customerId") == customerId) {
                data.doc.dueAmountKhr = data.doc.dueAmountKhr;
            }
            else {
                data.doc.dueAmountKhr = dueAmountKhr;
            }

            if (data.doc.dueAmountUsd && _.isUndefined(dueAmountUsd)) {
                data.doc.dueAmountUsd = data.doc.dueAmountUsd;
            }
            else if (FlowRouter.getParam("customerId") == customerId) {
                data.doc.dueAmountUsd = data.doc.dueAmountUsd;
            }
            else {
                data.doc.dueAmountUsd = dueAmountUsd;
            }

            if (data.doc.dueAmountThb && _.isUndefined(dueAmountThb)) {
                data.doc.dueAmountThb = data.doc.dueAmountThb;
            }
            else if (FlowRouter.getParam("customerId") == customerId) {
                data.doc.dueAmountThb = data.doc.dueAmountThb;
            }
            else {
                data.doc.dueAmountThb = dueAmountThb;
            }

            Template.instance().dueAmountKhr.set(roundKhrCurrency(data.doc.dueAmountKhr || 0));
            Template.instance().paidAmountKhr.set(data.doc.paidAmountKhr);
            Template.instance().dueAmountUsd.set(data.doc.dueAmountUsd || 0);
            Template.instance().paidAmountUsd.set(data.doc.paidAmountUsd);
            Template.instance().dueAmountThb.set(data.doc.dueAmountThb || 0);
            Template.instance().paidAmountThb.set(data.doc.paidAmountThb);
            Session.set('printId', data.doc.printId);
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
    },
    customerId(){
        // note : we use $(".customerId").val() when update because Session not work well
        let customerId = Session.get('customerIdForSaveAndPayment') || $(".customerId").val();
        if (customerId) {
            return customerId;
        }
    },
    employeeId(){
        let employeeId = Session.get('employeeIdForSaveAndPayment');
        if (employeeId) {
            return employeeId;
        } else {
            return $('[name="employeeId"]').val();
        }
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
    },
    'change [name="customerId"]'(event, instance){
        let customerId = event.currentTarget.value;
        instance.customerId.set(customerId);
    },
    'click .js-save-and-print'(event, instance){
        Session.set('saveAndPrint', 'fire');
    }
});

formTmpl.onDestroyed(function () {
    Session.set('printId', null);
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
        let saveAndPrint = Session.get('saveAndPrint');
        if (saveAndPrint == null) {
            alertify.orderVipPayment().close();
        }

        if (saveAndPrint == "fire") {
            let printId = Session.get('printId');
            alertify.orderVipInvoice(fa('print', 'Order Vip Invoice'), renderTemplate(Template.Moto_invoiceVipReportGen, {
                printId: printId
            })).maximize();
        }

        displaySuccess();
        // clear
        Session.set('saveAndPrint', null);
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Moto_orderVipPaymentForm'], hooksObject);

function checkLastOrderVipPayment(customer) {
    let data = OrderVipPayment.findOne({customerId: customer}, {sort: {_id: -1}});
    if (data) {
        return data._id;
    }
};