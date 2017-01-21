import {Template} from 'meteor/templating';
import {AutoForm} from 'meteor/aldeed:autoform';
import {Roles} from  'meteor/alanning:roles';
import {alertify} from 'meteor/ovcharik:alertifyjs';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {fa} from 'meteor/theara:fa-helpers';
import {lightbox} from 'meteor/theara:lightbox-helpers';
import {TAPi18n} from 'meteor/tap:i18n';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';
import {_} from 'meteor/erasaur:meteor-lodash';
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
import {OrderPayment} from '../../common/collections/orderPayment.js';

// Tabular
import {OrderPaymentTabular} from '../../common/tabulars/orderPayment.js';

// Page
import './orderPayment.html';

// Method
import {lookupOrderPayment} from '../../common/methods/lookupOrderPayment';

// Declare template
let indexTmpl = Template.Moto_orderPayment,
    formTmpl = Template.Moto_orderPaymentForm,
    showTmpl = Template.Moto_orderPaymentShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('orderPayment', {size: 'sm'});
    createNewAlertify('orderInvoice', {size: 'lg'});
    createNewAlertify('orderPaymentShow');
});

indexTmpl.helpers({
    tabularTable(){
        return OrderPaymentTabular;
    },
    selector() {
        return {
            branchId: Session.get('currentByBranch'),
            customerId: FlowRouter.getParam("customerId"),
            // orderId: FlowRouter.getParam("orderId")
        };
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.orderPayment(fa('plus', 'Order Payment'), renderTemplate(formTmpl));
    },
    'click .js-update' (event, instance) {
        if (checkLastOrderPayment(this.customerId) == this._id) {
            alertify.orderPayment(fa('pencil', 'Order Payment'), renderTemplate(formTmpl, {orderPaymentId: this._id}));
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
        if (checkLastOrderPayment(this.customerId) == this._id) {
            destroyAction(
                OrderPayment,
                {_id: this._id},
                {title: 'Order Payment', itemTitle: this._id}
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
        alertify.orderPaymentShow(fa('eye', 'Order Payment'), renderTemplate(showTmpl, {orderPaymentId: this._id}));
    }
});

// Form
formTmpl.onCreated(function () {
    this.autorun(()=> {
        // Lookup value
        this.subscribe('moto.lookupValue', ['Gender', 'Contact Type', 'OrderPayment Type']);

        let currentData = Template.currentData();
        if (currentData) {
            this.subscribe('moto.orderPaymentById', currentData.orderPaymentId);
        }
    });

    let self = this;
    self.paymentDoc = new ReactiveVar();
    self.dueAmount = new ReactiveVar();
    self.paidAmount = new ReactiveVar();
    self.customerId = new ReactiveVar();

    // note : we use $('[name="customerId"]').val() when update because Session not work well
    self.autorun(()=> {
        let customerId = Template.instance().customerId.get() || Session.get('customerIdForSaveAndPayment') || $('[name="customerId"]').val();

        if (customerId) {
            lookupOrderPayment.callPromise({
                customerId: customerId
            }).then((result)=> {
                if (!_.isUndefined(result)) {
                    self.dueAmount.set(roundKhrCurrency(result.payment.total) || roundKhrCurrency(result.payment.balance));
                } else {
                    self.dueAmount.set(0);
                }

                if (result.printId) {
                    Session.set('printId', result.printId);
                }

                self.paymentDoc.set(result);
            }).catch((err)=> {
                console.log(err);
            });
        }
    });
});

formTmpl.helpers({
    collection(){
        return OrderPayment;
    },
    schema(){
        // note : we use $('.customerId').val() when update because Session not work well
        if (Session.get('customerIdForSaveAndPayment') || $('.customerId').val()) {
            return OrderPayment.ForSaveAndPaymentSchema;
        }

        return OrderPayment.schema;
    },
    data () {
        let paymentDoc = Template.instance().paymentDoc.get();
        let dueAmount = Template.instance().dueAmount.get();
        let customerId = Template.instance().customerId.get();
        let data = {
            formType: 'insert',
            doc: {
                orderId: _.isUndefined(paymentDoc) ? 404 : paymentDoc._id,
                dueAmount: roundKhrCurrency(dueAmount),
                paidDate: moment().toDate(),
                printId: _.isUndefined(paymentDoc) ? 404 : paymentDoc.printId
            }
        };
        let currentData = Template.currentData();
        if (currentData) {
            data.formType = 'update';
            data.doc = OrderPayment.findOne(currentData.orderPaymentId);
            if (data.doc.dueAmount && _.isUndefined(dueAmount)) {
                data.doc.dueAmount = data.doc.dueAmount;

            } else if (FlowRouter.getParam("customerId") == customerId) {
                data.doc.dueAmount = data.doc.dueAmount;
            } else {
                data.doc.dueAmount = dueAmount;
            }

            Template.instance().dueAmount.set(roundKhrCurrency(data.doc.dueAmount));
            Template.instance().paidAmount.set(roundKhrCurrency(data.doc.paidAmount));
            Session.set('printId', data.doc.printId);
        }

        return data;
    },
    balance (){
        let instance = Template.instance();
        let dueAmount = instance.dueAmount.get();
        let paidAmount = instance.paidAmount.get();

        return dueAmount - paidAmount;
    },
    customerId(){
        // note : we use $('.customerId').val() when update because Session not work well
        let customerId = Session.get('customerIdForSaveAndPayment') || $('.customerId').val();
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
    'keyup [name="paidAmount"]'(event, instance){
        let paidAmount = event.currentTarget.value;
        instance.paidAmount.set(paidAmount);
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
        this.subscribe('moto.orderPaymentById', currentData.orderPaymentId);
    });
});

showTmpl.helpers({
    data () {
        let currentData = Template.currentData();
        return OrderPayment.findOne(currentData.orderPaymentId);
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
            alertify.orderPayment().close();
        }

        if (saveAndPrint == "fire") {
            let printId = Session.get('printId');
            alertify.orderInvoice(fa('print', 'Order Invoice'), renderTemplate(Template.Moto_invoiceReportGen, {
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

AutoForm.addHooks(['Moto_orderPaymentForm'], hooksObject);

function checkLastOrderPayment(customer, orderId) {
    let data = OrderPayment.findOne({customerId: customer}, {sort: {_id: -1}});

    if (data) {
        return data._id;
    }
};