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
    createNewAlertify('orderPaymentShow',);
});

indexTmpl.helpers({
    tabularTable(){
        return OrderPaymentTabular;
    },
    selector() {
        return {branchId: Session.get('currentByBranch'), orderId: FlowRouter.getParam("orderId")};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.orderPayment(fa('plus', 'Order Payment'), renderTemplate(formTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.orderPayment(fa('pencil', 'Order Payment'), renderTemplate(formTmpl, {orderPaymentId: this._id}));
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            OrderPayment,
            {_id: this._id},
            {title: 'Order Payment', itemTitle: this._id}
        );
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

    self.autorun(()=> {
        let orderId = FlowRouter.getParam("orderId");

        if (orderId) {
            lookupOrderPayment.callPromise({
                orderId: orderId
            }).then((result)=> {
                self.dueAmount.set(result.payment.total || result.payment.balance);
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
    data () {
        let paymentDoc = Template.instance().paymentDoc.get();

        let data = {
            formType: 'insert',
            doc: {
                orderId: paymentDoc._id,
                customerId: paymentDoc.customerId,
                dueAmount: paymentDoc.payment.total || paymentDoc.payment.balance,
                paidDate: moment().toDate()
            }
        };
        let currentData = Template.currentData();

        if (currentData) {
            data.formType = 'update';
            data.doc = OrderPayment.findOne(currentData.orderPaymentId);
            Template.instance().dueAmount.set(data.doc.dueAmount);
            Template.instance().paidAmount.set(data.doc.paidAmount);
        }

        return data;
    },
    balance (){
        let instance = Template.instance();
        let dueAmount = instance.dueAmount.get();
        let paidAmount = instance.paidAmount.get();

        return dueAmount - paidAmount;
    }
});

formTmpl.events({
    'keyup [name="paidAmount"]'(event, instance){
        let paidAmount = event.currentTarget.value;
        instance.paidAmount.set(paidAmount);
    }
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
        if (formType == 'update') {
            alertify.orderPayment().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Moto_orderPaymentForm'], hooksObject);
