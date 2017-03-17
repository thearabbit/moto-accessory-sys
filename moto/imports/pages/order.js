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
import {round2} from 'meteor/theara:round2';
import 'meteor/tap:i18n-ui';

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
import {lookupOrder} from '../../common/methods/lookupOrder';
import {lookupOrderLog} from '../../common/methods/lookupOrderLog';

// Collection
import {Order} from '../../common/collections/order.js';
import {OrderPayment} from '../../common/collections/orderPayment.js';
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
    formSaveAndPayment = Template.Moto_orderPaymentForm,
    showTmpl = Template.Moto_orderShow;

// Local collection
let itemsCollection = new Mongo.Collection(null);
// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('order', {size: 'lg'});
    createNewAlertify('orderInvoice', {size: 'lg'});
    createNewAlertify('orderPayment', {size: 'sm'});
    createNewAlertify('orderShow');
    createNewAlertify('customerAddOn', {size: 'sm'});
    createNewAlertify('employeeAddOn', {size: 'sm'});
    this.subscribe('moto.orderPayment');
    this.subscribe('moto.exchange');
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
        if (checkLastOrder(this.customerId) == this._id && _.isUndefined(checkOrderPaymentExist(this._id))) {
            alertify.order(fa('pencil', 'Order'), renderTemplate(formTmpl, {orderId: this._id})).maximize();
            Session.set("update", true);
        }
        else if (checkOrderPaymentExist(this._id) == this._id) {
            swal({
                title: "Information",
                type: "info",
                text: "Hmm , look like this record already payment , please delete it !",
                timer: 2200,
                showConfirmButton: false
            });
        }
        else {
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
        if (checkLastOrder(this.customerId) == this._id && _.isUndefined(checkOrderPaymentExist(this._id))) {
            destroyAction(
                Order,
                {_id: this._id},
                {title: 'Order', itemTitle: this._id}
            );
        }
        else if (checkOrderPaymentExist(this._id) == this._id) {
            swal({
                title: "Information",
                type: "info",
                text: "Hmm , look like this record already payment , please delete it !",
                timer: 2200,
                showConfirmButton: false
            });
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
        alertify.orderShow(fa('eye', 'Order'), renderTemplate(showTmpl, {orderId: this._id})).maximize();
    },
    'click .js-invoice' (event, instance) {
        let params = {};
        let queryParams = {orderId: this._id};
        let path = FlowRouter.path("moto.invoiceReportGe", params, queryParams);

        window.open(path);
    },
    'click .js-payment' (event, instance) {
        alertify.orderPayment(fa('plus', 'Order Payment'), renderTemplate(Template.Moto_orderPaymentForm));
    },
    'click .js-payment-form' (event, instance){
        let params = {
            customerId: this.customerId,
            orderId: this._id,
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
    self.lastOrderBalance = new ReactiveVar(0);
    self.des = new ReactiveVar();

    Session.set('customerType', 'Retail');
    if (!Template.currentData()) {
        Session.set('discountType', 'Percentage');
    }

    //default customer type
    Session.set('customerType', 'Whole');

    //default exchange rate
    let exchange = Exchange.findOne({_id: "001"});
    Session.set('exchangeDoc', exchange);

    self.autorun(() => {
        // Lookup value
        this.subscribe('moto.lookupValue', ['Order Type', 'Discount Type']);

        let currentData = Template.currentData();
        if (currentData) {
            self.isLoading.set(true);

            lookupOrder.callPromise({
                orderId: currentData.orderId
            }).then((result) => {
                Session.set('customerType', result.type);
                Session.set('customerIdForSaveAndPayment', result.customerId);

                // Add items to local collection
                _.forEach(result.items, (value) => {
                    itemsCollection.insert(value);
                });

                let lastIndex = itemsCollection.findOne({}, {sort: {orderIndex: -1}}).orderIndex;
                Session.set('lastIndex', lastIndex);

                self.lastOrderBalance.set(result.lastOrderBalance);
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

            let exchange = Exchange.findOne({_id: data.doc.exchangeId});
            Session.set('exchangeDoc', exchange);
            Session.set('discountAmountUpdate', data.doc.discountAmount);
            Session.set('updateType', "work");
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
    // image(){
    //     let result = "/no-image.png";
    //     if (Session.get("image")) {
    //         let photoUrl = Files.findOne({_id: Session.get("image")}).url();
    //         result = photoUrl;
    //
    //     }
    //     return result;
    // },
    orderLog(){
        let instance = Template.instance();
        return instance.orderLog.get();
    },
    lastOrderBalance(){
        let instance = Template.instance();
        let lastOrderBalance = _.isUndefined(instance.lastOrderBalance.get()) ? 0 : instance.lastOrderBalance.get();
        return roundKhrCurrency(lastOrderBalance);
    },
    description(){
        let instance = Template.instance();
        return instance.des.get();
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
        let currentData = Template.currentData();
        Session.set('customerIdForSaveAndPayment', customerId);
        lookupOrderLog.callPromise({
            customerId: customerId
        }).then((result) => {
            let data = result;
            if (_.isUndefined(result)) {
                data = 0;
            }

            if (currentData && customerId == "") {
                instance.lastOrderBalance.set(instance.orderDoc.get().lastOrderBalance);
            } else if (currentData && instance.orderDoc.get().customerId == customerId) {
                instance.lastOrderBalance.set(instance.orderDoc.get().lastOrderBalance);
            }
            else {
                instance.lastOrderBalance.set(data.totalOrderLog);
                instance.des.set(data.des);
            }

            instance.orderLog.set(data);
        }).catch((err) => {
            console.log(err);
        });

        // Clear session when success
        Session.set('save', null);
        Session.set('saveAndPayment', null);
        Session.set('saveAndPrint', null);
    },
    'change [name="employeeId"]': function (event, instance) {
        let employeeId = event.currentTarget.value;
        Session.set('employeeIdForSaveAndPayment', employeeId);
    },
    'click .js-save': function (event, instance) {
        Session.set('save', 'fire');
    },
    'click .js-save-and-payment': function (event, instance) {
        Session.set('saveAndPayment', 'fire');
    },
    'click .js-save-and-print': function (event, instance) {
        Session.set('saveAndPrint', 'fire');
    },
    'click .customerAddOn': function (e, t) {
        alertify.customerAddOn(fa("plus", "Customer"), renderTemplate(Template.Moto_customerForm));
    },
    'click .employeeAddOn': function (e, t) {
        alertify.employeeAddOn(fa("plus", "Employee"), renderTemplate(Template.Moto_employeeForm));
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
    Session.set('total', null);
    Session.set('saveAndPayment', null);
    Session.set('saveAndPrint', null);
    Session.set('save', null);
    Session.set('findItems', null);
    Session.set('customerIdForSaveAndPayment', null);
    Session.set('employeeIdForSaveAndPayment', null);
    Session.set('lastIndex', null);
    Session.set('updateType', null);
    $(document).off('keyup');
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
    checkClosedDate(){
        let data = Template.instance().orderDoc.get();
        let result;
        data.closedDate == "" ? result = "Active" : result = moment(data.closedDate).format('DD/MM/YYYY hh:mm:ss A');
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
        let save = Session.get('save');
        let saveAndPayment = Session.get('saveAndPayment');
        let saveAndPrint = Session.get('saveAndPrint');

        // For update
        if (formType == 'update' && save == "fire") {
            alertify.order().close();
        }

        if (formType == 'update' && saveAndPrint == "fire") {
            if (saveAndPrint == "fire") {
                let printId = $('[name="printId"]').val();
                alertify.orderInvoice(fa('print', 'Order Invoice'), renderTemplate(Template.Moto_invoiceReportGen, {
                    printId: printId
                })).maximize();
            }

            alertify.order().close();
        }

        if (formType == 'update' && saveAndPayment == "fire") {
            // let saveAndPayment = Session.get('saveAndPayment');
            if (saveAndPayment == "fire") {
                alertify.orderPayment(fa('plus', 'Order Payment'), renderTemplate(formSaveAndPayment));
            }
        }


        // Remove items collection
        itemsCollection.remove({});
        $('[name="itemId"]').val(null).trigger('change');
        $('[name="qty"]').val(null);
        $('[name="price"]').val(null);
        $('[name="amount"]').val(null);
        $('[name="totalAmount"]').val(null);
        $('[name="subTotal"]').val(null);
        $('[name="discountAmount"]').val(null);
        $('[name="total"]').val(null);
        $('[name="lastOrderBalance"]').val(null);
        $('[name="des"]').val(null);

        // For Insert
        if (saveAndPayment == "fire") {
            alertify.orderPayment(fa('plus', 'Order Payment'), renderTemplate(formSaveAndPayment));
        }

        if (saveAndPrint == "fire") {
            alertify.orderInvoice(fa('print', 'Order Invoice'), renderTemplate(Template.Moto_invoiceReportGen, {
                printId: result
            })).maximize();
        }

        displaySuccess();

        // Clear session when success
        Session.set('save', null);
        Session.set('saveAndPayment', null);
        Session.set('saveAndPrint', null);
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Moto_orderForm'], hooksObject);

function checkLastOrder(customer) {
    let data = Order.findOne({customerId: customer}, {sort: {_id: -1}});
    if (data) {
        return data._id;
    }
};

function checkOrderPaymentExist(order) {
    let data = OrderPayment.findOne({orderId: order});
    if (data) {
        return data.orderId;
    }
};