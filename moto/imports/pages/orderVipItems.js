import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {AutoForm} from 'meteor/aldeed:autoform';
import {Roles} from  'meteor/alanning:roles';
import {alertify} from 'meteor/ovcharik:alertifyjs';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {fa} from 'meteor/theara:fa-helpers';
import {lightbox} from 'meteor/theara:lightbox-helpers';
import {_} from 'meteor/erasaur:meteor-lodash';
import {$} from 'meteor/jquery';
import {TAPi18n} from 'meteor/tap:i18n';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';
import {round2} from 'meteor/theara:round2';
import fx from "money";

// Lib
import {createNewAlertify} from '../../../core/client/libs/create-new-alertify.js';
import {renderTemplate} from '../../../core/client/libs/render-template.js';
import {destroyAction} from '../../../core/client/libs/destroy-action.js';
import {displaySuccess, displayError} from '../../../core/client/libs/display-alert.js';
import {reactiveTableSettings} from '../../../core/client/libs/reactive-table-settings.js';
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';

// Component
import '../../../core/client/components/loading.js';
import '../../../core/client/components/column-action.js';
import '../../../core/client/components/form-footer.js';

// Method
import {lookupItem} from '../../common/methods/lookupItem.js';

// Collection

// Page
import './orderVipItems.html';
import {OrderVipItemsSchema} from "../../common/collections/orderVipItems";

// Declare template
let indexTmpl = Template.Moto_orderVipItems,
    actionTmpl = Template.Moto_orderVipItemsAction,
    newTmpl = Template.Moto_orderVipItemsNew,
    editTmpl = Template.Moto_orderVipItemsEdit;

// Local collection
let itemsCollection;

// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('item');

    // Data context
    let data = Template.currentData();
    itemsCollection = data.itemsCollection;
    this.discountAmount = new ReactiveVar(0);
    this.discountAmountUsd = new ReactiveVar(0);
    this.discountAmountThb = new ReactiveVar(0);
});

indexTmpl.helpers({
    tableSettings: function () {
        let i18nPrefix = 'moto.order.schema';

        let reactiveTableData = _.assignIn(_.clone(reactiveTableSettings), {
            showFilter: false,
            showNavigation: 'never',
            showColumnToggles: false,
            collection: itemsCollection,
            fields: [
                {key: 'itemId', label: 'ID', hidden: false},
                {key: 'itemName', label: 'Item'},
                {
                    key: 'qty',
                    label: 'Qty',
                    // fn(value, obj, key){
                    //     return Spacebars.SafeString(`<input type="text" value="${value}" class="item-qty">`);
                    // }
                },
                {
                    key: 'orderPrice',
                    label: 'Order Price',
                    fn(value, obj, key){
                        return `${obj.itemCurrency} ${value}`;
                    }
                },
                {
                    key: 'discount',
                    label: 'Discount',
                    // fn(value, obj, key){
                    //     return result;
                    // }
                },
                {
                    key: 'amount',
                    label: 'Amount',
                    fn (value, obj, key) {
                        return `${obj.itemCurrency} ${value}`;
                    }
                },
                {
                    key: 'totalAmount',
                    label: 'Total Amount',
                    fn (value, obj, key) {
                        return `${obj.itemCurrency} ${value}`;
                    }
                },
                {
                    key: 'memo',
                    label: 'Memo',
                },
                {
                    key: '_id',
                    label(){
                        return fa('bars', '', true);
                    },
                    headerClass: function () {
                        let css = 'text-center col-action-order-item';
                        return css;
                    },
                    tmpl: actionTmpl, sortable: false
                }
            ],
        });

        return reactiveTableData;
    },
    subTotal: function () {
        let total = 0;
        let getItems = itemsCollection.find();
        getItems.forEach((obj) => {
            if (obj.currencyId == "KHR") {
                total += round2(obj.totalAmount, 2);
            }
        });

        return total;
    },
    total: function () {
        const instance = Template.instance();
        let total = 0;
        let getItems = itemsCollection.find();
        let discountAmount;

        if(instance.discountAmount.get() == null){
            discountAmount = 0;
        }else if(instance.discountAmount.get()){
            discountAmount = instance.discountAmount.get();
        }else{
            discountAmount = Session.get('discountAmountUpdate');
        }

        getItems.forEach((obj) => {
            if (obj.currencyId == "KHR") {
                total += obj.totalAmount;
            }
        });

        return round2(total - discountAmount, 2);
    },
    subTotalUsd: function () {
        let total = 0;
        let getItems = itemsCollection.find();
        getItems.forEach((obj) => {
            if (obj.currencyId == "USD") {
                total += obj.totalAmount;
            }
        });

        return total;
    },
    totalUsd: function () {
        const instance = Template.instance();
        let total = 0;
        let getItems = itemsCollection.find();
        let discountAmountUsd;
        if(instance.discountAmountUsd.get() == null){
            discountAmountUsd = 0;
        }else if(instance.discountAmountUsd.get()){
            discountAmountUsd = instance.discountAmountUsd.get();
        }else{
            discountAmountUsd = Session.get('discountAmountUsdUpdate');
        }

        getItems.forEach((obj) => {
            if (obj.currencyId == "USD") {
                total += obj.totalAmount;
            }
        });

        return total - discountAmountUsd;
    },
    subTotalThb: function () {
        let total = 0;
        let getItems = itemsCollection.find();
        getItems.forEach((obj) => {
            if (obj.currencyId == "THB") {
                total += obj.totalAmount;
            }
        });

        return total;
    },
    totalThb: function () {
        const instance = Template.instance();
        let total = 0;
        let getItems = itemsCollection.find();
        let discountAmountThb;

        if(instance.discountAmountThb.get() == null){
            discountAmountThb = 0;
        }else if(instance.discountAmountThb.get()){
            discountAmountThb = instance.discountAmountThb.get();
        }else{
            discountAmountThb = Session.get('discountAmountThbUpdate');
        }

        getItems.forEach((obj) => {
            if (obj.currencyId == "THB") {
                total += obj.totalAmount;
            }
        });

        return total - discountAmountThb;
    }
});

indexTmpl.events({
    'click .js-update-item': function (event, instance) {
        alertify.item(fa('pencil', 'Items'), renderTemplate(editTmpl, this));
    },
    'click .js-destroy-item': function (event, instance) {
        destroyAction(
            itemsCollection,
            {_id: this._id},
            {title: 'Items', itemTitle: this.itemId}
        );
    },
    'change .item-qty,.item-price,.item-memo': function (event, instance) {
        let $parents = $(event.currentTarget).parents('tr');

        let itemId = $parents.find('.itemId').text();
        let qty = $parents.find('.item-qty').val();
        let price = $parents.find('.item-price').val();
        let memo = $parents.find('.item-memo').val();

        qty = _.isEmpty(qty) ? 0 : parseInt(qty);
        price = _.isEmpty(price) ? 0 : parseFloat(price);
        let amount = round2(qty * price, 2);

        itemsCollection.update(
            {_id: itemId},
            {$set: {qty: qty, price: price, amount: amount, memo: memo}}
        );
    },
    'keyup [name="discountAmount"]': function (event, instance) {
        let discountAmount = event.currentTarget.value;
        instance.discountAmount.set(discountAmount);
    },
    'keyup [name="discountAmountUsd"]': function (event, instance) {
        let discountAmountUsd = event.currentTarget.value;
        instance.discountAmountUsd.set(discountAmountUsd);
    },
    'keyup [name="discountAmountThb"]': function (event, instance) {
        let discountAmountThb = event.currentTarget.value;
        instance.discountAmountThb.set(discountAmountThb);
    }
});

// New
newTmpl.onCreated(function () {
    // State
    this.itemId = new ReactiveVar();
    this.itemDoc = new ReactiveVar();
    this.qty = new ReactiveVar(0);
    this.orderPrice = new ReactiveVar(0);
    this.price = new ReactiveVar(0);
    this.khrPrice = new ReactiveVar(0);
    this.amount = new ReactiveVar(0);
    this.currencyId = new ReactiveVar();
    this.discountType = new ReactiveVar();
    this.discount = new ReactiveVar(0);
    this.totalAmount = new ReactiveVar(0);
});

newTmpl.onRendered(function () {
    $('[name="currencyId"]').hide();
    $('[name="price"]').hide();
    $('[name="khrPrice"]').hide();
});

newTmpl.helpers({
    schema(){
        return OrderVipItemsSchema;
    },
    orderPrice: function () {
        const instance = Template.instance();
        let result, customerType = Session.get('customerType');
        if (customerType == "Vip") {
            result = instance.price.get();
        }

        return result;
    },
    itemDoc: function () {
        return Template.instance().itemDoc.get();
    },
    amount: function () {
        const instance = Template.instance();
        let amount, customerType = Session.get('customerType'), orderPrice = instance.orderPrice.get();
        if (customerType == "Vip") {
            amount = instance.qty.get() * instance.price.get();
        }

        instance.amount.set(orderPrice > 0 ? instance.qty.get() * orderPrice : amount);
        return orderPrice > 0 ? instance.qty.get() * orderPrice : amount;
    },
    totalAmount: function () {
        const instance = Template.instance();
        let totalAmount, amount = instance.amount.get(), discount = instance.discount.get(), discountType = Session.get('discountType');

        if (discountType == "Percentage") {
            totalAmount = amount - (amount * discount / 100);
        } else {
            totalAmount = amount - discount;
        }
        return totalAmount;
    },
    disabledAddItemBtn: function () {
        const instance = Template.instance();
        if (instance.itemId.get() && instance.qty.get() > 0) {
            return {};
        }

        return {disabled: true};
    },
});

newTmpl.events({
    'change [name="itemId"]': function (event, instance) {
        let itemId = event.currentTarget.value;
        instance.itemId.set(itemId);

        // Check item value
        if (itemId) {
            $.blockUI();
            lookupItem.callPromise({
                itemId: itemId
            }).then((result) => {
                instance.price.set(result.price);
                instance.khrPrice.set(result.khrPrice);
                instance.currencyId.set(result.currencyId);
                instance.itemDoc.set(result);
                instance.orderPrice.set(0);

                Meteor.setTimeout(() => {
                    $.unblockUI();
                }, 100);

            }).catch((err) => {
                console.log(err.message);
            });
        } else {
            instance.price.set(0);
            instance.khrPrice.set(0);
            instance.itemDoc.set(undefined);
        }

        // Clear
        instance.$('[name="qty"]').val(1);
        instance.qty.set(1);
    },
    'keyup [name="qty"],[name="orderPrice"],[name="discount"]': function (event, instance) {
        let qty = instance.$('[name="qty"]').val();
        let orderPrice = instance.$('[name="orderPrice"]').val();
        let discount = instance.$('[name="discount"]').val();
        qty = _.isEmpty(qty) ? 0 : parseInt(qty);
        orderPrice = _.isEmpty(orderPrice) ? 0 : parseFloat(orderPrice);
        discount = _.isEmpty(discount) ? 0 : parseFloat(discount);

        instance.qty.set(qty);
        instance.orderPrice.set(orderPrice);
        instance.discount.set(discount);
    },
    'click .js-add-item': function (event, instance) {
        let itemId = instance.$('[name="itemId"]').val();
        let itemName = _.trim(_.split(instance.$('[name="itemId"] option:selected').text(), " [")[0]);
        itemName = _.trim(_.split(itemName, " : ")[1]);

        let qty = parseInt(instance.$('[name="qty"]').val());
        let price = round2(parseFloat(instance.$('[name="price"]').val()), 2);
        let khrPrice = parseFloat(instance.$('[name="khrPrice"]').val());
        let currency = instance.$('[name="currencyId"]').val();
        let orderPrice = round2(parseFloat(instance.$('[name="orderPrice"]').val()), 2);
        let discount = parseFloat(instance.$('[name="discount"]').val() || 0);
        let amount = round2(parseFloat(instance.$('[name="amount"]').val()), 2);
        let totalAmount = round2(parseFloat(instance.$('[name="totalAmount"]').val()), 2);
        let memo = instance.$('[name="memo"]').val();
        let discountType, itemCurrency;

        if (currency == "KHR") {
            itemCurrency = "៛";
        } else if (currency == "USD") {
            itemCurrency = "$";
        } else {
            itemCurrency = "B";
        }

        if (Session.get('discountType') == "Percentage") {
            discountType = "%";
        } else {
            discountType = itemCurrency;
        }

        // Check exist
        let exist = itemsCollection.findOne({itemId: itemId});
        if (exist) {
            qty += parseInt(exist.qty);
            amount = qty * orderPrice;
            if (discountType == "%") {
                totalAmount = amount - (amount * discount / 100);
            } else {
                totalAmount = amount - discount;
            }

            itemsCollection.update(
                {_id: itemId},
                {
                    $set: {
                        qty: qty,
                        price: price,
                        itemCurrency: itemCurrency,
                        orderPrice: orderPrice,
                        discount: discount,
                        discountType: discountType,
                        amount: amount,
                        totalAmount: totalAmount,
                        memo: memo
                    }
                }
            );
        } else {
            itemsCollection.insert({
                _id: itemId,
                itemId: itemId,
                itemName: itemName,
                qty: qty,
                currencyId: currency,
                itemCurrency: itemCurrency,
                price: price,
                khrPrice: khrPrice,
                orderPrice: orderPrice,
                discount: discount,
                discountType: discountType,
                amount: amount,
                totalAmount: totalAmount,
                memo: memo
            });
        }
    }
});

// Edit
editTmpl.onCreated(function () {
    this.itemId = new ReactiveVar();
    this.itemDoc = new ReactiveVar();
    this.qty = new ReactiveVar(0);
    this.orderPrice = new ReactiveVar(0);
    this.price = new ReactiveVar(0);
    this.khrPrice = new ReactiveVar(0);
    this.amount = new ReactiveVar(0);
    this.currencyId = new ReactiveVar();
    this.discount = new ReactiveVar(0);
    this.totalAmount = new ReactiveVar(0);

    this.autorun(() => {
        let data = Template.currentData();
        this.qty.set(data.qty);
        this.price.set(data.price);
        this.currencyId.set(data.currencyId);
        this.khrPrice.set(data.khrPrice);
        this.discount.set(data.discount);
    });
});

editTmpl.onRendered(function () {
    $('[name="currencyId"]').hide();
    $('[name="price"]').hide();
    $('[name="khrPrice"]').hide();
});

editTmpl.helpers({
    schema(){
        return OrderVipItemsSchema;
    },
    data: function () {
        let data = Template.currentData();
        return data;
    },
    orderPrice: function () {
        const instance = Template.instance();
        let result, exchangeDoc = Session.get('exchangeDoc'), customerType = Session.get('customerType');

        if (customerType == "Vip") {
            result = instance.price.get();
        }

        return result;
    },
    itemDoc: function () {
        return Template.instance().itemDoc.get();
    },
    amount: function () {
        const instance = Template.instance();
        let amount, customerType = Session.get('customerType'), orderPrice = instance.orderPrice.get();

        if (customerType == "Vip") {
            amount = instance.qty.get() * instance.price.get();
        }

        instance.amount.set(orderPrice > 0 ? instance.qty.get() * orderPrice : amount);
        return orderPrice > 0 ? instance.qty.get() * orderPrice : amount;
    },
    totalAmount: function () {
        const instance = Template.instance();
        let totalAmount, amount = instance.amount.get(), discount = instance.discount.get(), discountType = Session.get('discountType');

        if (discountType == "Percentage") {
            totalAmount = amount - (amount * discount / 100);
        } else {
            totalAmount = amount - discount;
        }
        return totalAmount;
    }
});

editTmpl.events({
    'change [name="itemId"]': function (event, instance) {
        let itemId = event.currentTarget.value;

        // Check item value
        if (itemId) {
            $.blockUI();
            lookupItem.callPromise({
                itemId: itemId
            }).then((result) => {
                instance.price.set(result.price);
                instance.khrPrice.set(result.khrPrice);
                instance.currencyId.set(result.currencyId);
                instance.itemDoc.set(result);
                instance.orderPrice.set(0);
                Meteor.setTimeout(() => {
                    $.unblockUI();
                }, 100);

            }).catch((err) => {
                console.log(err.message);
            });
        } else {
            instance.price.set(0);
            instance.khrPrice.set(0);
            instance.currencyId.set(undefined);
        }
    },
    'keyup [name="qty"],[name="orderPrice"],[name="discount"]': function (event, instance) {
        let qty = instance.$('[name="qty"]').val();
        let orderPrice = instance.$('[name="orderPrice"]').val();
        let discount = instance.$('[name="discount"]').val();
        qty = _.isEmpty(qty) ? 0 : parseInt(qty);
        orderPrice = _.isEmpty(orderPrice) ? 0 : parseFloat(orderPrice);
        discount = _.isEmpty(discount) ? 0 : parseFloat(discount);

        instance.qty.set(qty);
        instance.orderPrice.set(orderPrice);
        instance.discount.set(discount);
    },
});

let hooksObject = {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
        this.event.preventDefault();

        let itemCurrency;
        if (insertDoc.currencyId == "KHR") {
            itemCurrency = "៛";
        } else if (insertDoc.currencyId == "USD") {
            itemCurrency = "$";
        } else {
            itemCurrency = "B";
        }

        // Check old item
        if (insertDoc.itemId == currentDoc.itemId) {
            itemsCollection.update(
                {_id: currentDoc.itemId},
                updateDoc
            );
        } else {
            itemsCollection.remove({_id: currentDoc.itemId});

            // Check exist item
            let exist = itemsCollection.findOne({_id: insertDoc.itemId});
            if (exist) {
                let newQty = exist.qty + insertDoc.qty;
                let newAmount = newQty * insertDoc.orderPrice;
                let newTotalAmount, newDiscount = insertDoc.discount;
                if (Session.get('discountType') == "Percentage") {
                    newTotalAmount = newAmount - (newAmount * newDiscount / 100);
                } else {
                    newTotalAmount = newAmount - newDiscount;
                }

                itemsCollection.update(
                    {_id: insertDoc.itemId},
                    {
                        $set: {
                            qty: newQty,
                            currencyId: insertDoc.currencyId,
                            price: insertDoc.price,
                            itemCurrency: itemCurrency,
                            khrPrice: insertDoc.khrPrice,
                            orderPrice: insertDoc.orderPrice,
                            discount: newDiscount,
                            amount: newAmount,
                            totalAmount: newTotalAmount,
                            memo: insertDoc.memo
                        }
                    }
                );
            } else {
                let itemName = Session.get('update') == true ? _.split($('[name="itemId"] option:selected').text(), " : ")[1] : _.split($('[name="itemId"] option:selected').text(), " : ")[2];

                itemsCollection.insert({
                    _id: insertDoc.itemId,
                    itemId: insertDoc.itemId,
                    itemName: itemName,
                    qty: insertDoc.qty,
                    currencyId: insertDoc.currencyId,
                    itemCurrency: itemCurrency,
                    price: insertDoc.price,
                    khrPrice: insertDoc.khrPrice,
                    orderPrice: insertDoc.orderPrice,
                    discount: insertDoc.discount,
                    amount: insertDoc.amount,
                    totalAmount: insertDoc.totalAmount,
                    memo: insertDoc.memo
                });
            }
        }

        this.done();
    },
    onSuccess: function (formType, result) {
        alertify.item().close();
        displaySuccess();
    },
    onError: function (formType, error) {
        displayError(error.message);
    }
};
AutoForm.addHooks(['Moto_orderVipItemsEdit'], hooksObject);
