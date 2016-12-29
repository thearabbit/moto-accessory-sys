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
import {roundKhrCurrency}  from '../../../moto/common/libs/roundKhrCurrency';

// Component
import '../../../core/client/components/loading.js';
import '../../../core/client/components/column-action.js';
import '../../../core/client/components/form-footer.js';


// Method
import {lookupItem} from '../../common/methods/lookupItem.js';

// Collection
import {OrderItemsSchema} from '../../common/collections/orderItems.js';

// Page
import './orderItems.html';

// Declare template
let indexTmpl = Template.Moto_orderItems,
    actionTmpl = Template.Moto_orderItemsAction,
    newTmpl = Template.Moto_orderItemsNew,
    editTmpl = Template.Moto_orderItemsEdit;

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
    this.purchasePriceHideAndShow = new ReactiveVar();
    // this.subscribe('moto.items');
});

indexTmpl.helpers({
    tableSettings: function () {
        let i18nPrefix = 'moto.order.schema';
        let instance = Template.instance();
        let reactiveTableData = _.assignIn(_.clone(reactiveTableSettings), {
            showFilter: false,
            showNavigation: 'never',
            showColumnToggles: false,
            rowsPerPage: 100,
            collection: itemsCollection,
            fields: [
                {key: 'itemId', label: 'ID', hidden: false},
                {key: 'itemName', label: 'Item'},
                {key: 'memo', label: 'Memo'},
                {
                    key: 'qty',
                    label: 'Qty',
                    fn(value, obj, key){
                        return `${value} ${obj.unit}`;
                    }
                    // fn(value, obj, key){
                    //     return Spacebars.SafeString(`<input type="text" value="${value}" class="item-qty">`);
                    // }
                },
                // {
                //     key: 'memo',
                //     label: 'Memo',
                // },
                {
                    key: 'purchasePrice',
                    label: 'Purchase Price',
                    fn(value, obj, key){
                        let currency;
                        if (obj.currencyId == "KHR") {
                            currency = "៛ " + value;
                        } else if (obj.currencyId == "USD") {
                            currency = "$ " + value;
                        } else {
                            currency = "B " + value;
                        }

                        if (instance.purchasePriceHideAndShow.get() == "show") {
                            return Spacebars.SafeString(`<span class="purchasePrice">${currency}</span>`);
                        } else {
                            return Spacebars.SafeString(`<span class="purchasePrice">*******************</span>`);
                        }
                    }
                },
                {
                    key: 'orderPrice',
                    label: 'Order Price',
                    fn(value, obj, key){
                        return `៛ ${value}`;
                    }
                },
                {
                    key: 'discount',
                    label: 'Discount',
                    fn(value, obj, key){
                        let type;
                        if (obj.discountType == "%") {
                            type = `${value} ${obj.discountType}`;
                        } else {
                            type = `${obj.discountType} ${value}`;
                        }
                        return type;
                    }
                },
                {
                    key: 'amount',
                    label: 'Amount',
                    fn (value, object, key) {
                        return `៛ ${value}`;
                    }
                },
                {
                    key: 'totalAmount',
                    label: 'Total Amount',
                    fn (value, object, key) {
                        return `៛ ${value}`;
                    }
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
            total += roundKhrCurrency(obj.totalAmount);
        });
        return total;
    },
    total: function () {
        const instance = Template.instance();
        let total = 0;
        let getItems = itemsCollection.find();
        let discountAmount = 0;

        if (_.isNull(instance.discountAmount.get()) || _.isUndefined(instance.discountAmount.get())) {
            discountAmount = 0;
        } else if (instance.discountAmount.get()) {
            discountAmount = instance.discountAmount.get();
        } else if (Session.get('discountAmountUpdate')) {
            discountAmount = Session.get('discountAmountUpdate');
        }

        getItems.forEach((obj) => {
            total += obj.totalAmount;
        });

        Session.set('total', roundKhrCurrency(total - discountAmount));
        return roundKhrCurrency(total - discountAmount);
    }
});

indexTmpl.events({
    'click .js-update-item': function (event, instance) {
        if (_.isNull(Session.get('discountType'))) {
            Session.set("discountType", this.discountType);
        } else {
            Session.set("discountType", Session.get('discountType'));
        }
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
    'click .purchasePrice': function (event, instance) {
        instance.purchasePriceHideAndShow.set('show');
    },
    'dblclick .purchasePrice': function (event, instance) {
        instance.purchasePriceHideAndShow.set('hide');
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
        return OrderItemsSchema;
    },
    orderPrice: function () {
        const instance = Template.instance();
        let result, exchangeDoc = Session.get('exchangeDoc'), customerType = Session.get('customerType');

        if (customerType == "Retail") {
            result = roundKhrCurrency(instance.khrPrice.get());
        } else {
            fx.base = "USD";
            fx.rates = {
                "KHR": exchangeDoc.rates.KHR,
                "USD": exchangeDoc.rates.USD,
                "THB": exchangeDoc.rates.THB
            }

            if (instance.currencyId.get() == "USD") {
                result = roundKhrCurrency(fx.convert(instance.price.get(), {from: "USD", to: "KHR"}));

            } else if (instance.currencyId.get() == "THB") {
                result = roundKhrCurrency(fx.convert(instance.price.get(), {from: "THB", to: "KHR"}));
            } else {
                result = roundKhrCurrency(instance.khrPrice.get());
            }
        }

        return result;
    },
    itemDoc: function () {
        return Template.instance().itemDoc.get();
    },
    amount: function () {
        const instance = Template.instance();
        let amount, exchangeDoc = Session.get('exchangeDoc'), customerType = Session.get('customerType'), orderPrice = instance.orderPrice.get();

        if (customerType == "Retail") {
            amount = roundKhrCurrency(instance.qty.get() * instance.khrPrice.get());
        } else {
            fx.base = "USD";
            fx.rates = {
                "KHR": exchangeDoc.rates.KHR,
                "USD": exchangeDoc.rates.USD,
                "THB": exchangeDoc.rates.THB
            }

            let tempAmount = instance.qty.get() * instance.price.get();

            if (instance.currencyId.get() == "USD") {
                amount = roundKhrCurrency((fx.convert(tempAmount, {from: "USD", to: "KHR"})));

            } else if (instance.currencyId.get() == "THB") {
                amount = roundKhrCurrency((fx.convert(tempAmount, {from: "THB", to: "KHR"})));
            } else if (instance.currencyId.get() == "KHR") {
                amount = roundKhrCurrency(instance.qty.get() * instance.khrPrice.get());
            }
        }

        instance.amount.set(orderPrice > 0 ? instance.qty.get() * orderPrice : amount);
        return orderPrice > 0 ? roundKhrCurrency(instance.qty.get() * orderPrice) : amount;
    },
    totalAmount: function () {
        const instance = Template.instance();
        let totalAmount, amount = instance.amount.get(), discount = instance.discount.get(), discountType = Session.get('discountType');

        if (discountType == "Percentage" || discountType == "%") {
            totalAmount = roundKhrCurrency(amount - (amount * discount / 100));
        } else {
            totalAmount = roundKhrCurrency((amount - discount));
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
    unit(){
        let result = fa("cubes"), itemDoc = Template.instance().itemDoc.get();
        if (itemDoc) {
            result = itemDoc.unitDoc.name;
        }
        return result;
    }
});

newTmpl.events({
    'change [name="itemId"]': function (event, instance) {
        let itemId = event.currentTarget.value;
        instance.itemId.set(itemId);

        // Check item value
        if (itemId) {
            // $.blockUI();
            lookupItem.callPromise({
                itemId: itemId
            }).then((result) => {
                if (_.isUndefined(result.purchase)) {
                    result.purchase = 0;
                }
                instance.price.set(result.price);
                instance.khrPrice.set(result.khrPrice);
                instance.currencyId.set(result.currencyId);
                Session.set("image", result.photo);
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

        //animate for member
        $('#animation').removeClass().addClass('animated bounceIn').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            $(this).removeClass('animated bounceIn');
        });
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
        let memoItem = instance.$('[name="memoItem"]').val();
        let itemName = _.trim(_.split(instance.$('[name="itemId"] option:selected').text(), " [")[0]);

        itemName = _.trim(_.split(itemName, " : ")[1]);
        let qty = parseInt(instance.$('[name="qty"]').val());
        let unit = instance.$('[name="unit"]').val();
        let purchasePrice = parseFloat(instance.$('[name="purchasePrice"]').val());
        let price = round2(parseFloat(instance.$('[name="price"]').val()), 2);
        let khrPrice = parseFloat(instance.$('[name="khrPrice"]').val());
        let currency = instance.$('[name="currencyId"]').val();
        let orderPrice = roundKhrCurrency(parseFloat(instance.$('[name="orderPrice"]').val()));
        let discount = parseFloat(instance.$('[name="discount"]').val() || 0);
        let amount = roundKhrCurrency(parseFloat(instance.$('[name="amount"]').val()));
        let totalAmount = roundKhrCurrency(parseFloat(instance.$('[name="totalAmount"]').val()));
        let memo = instance.$('[name="memo"]').val();
        let discountType = Session.get('discountType') == "Percentage" ? "%" : "៛";
        // Check exist
        // let exist = itemsCollection.findOne({itemId: itemId});
        // if (exist) {
        //     qty += parseInt(exist.qty);
        //     amount = round2(qty * orderPrice, 2);
        //     if (discountType == "%") {
        //         totalAmount = round2(amount - (amount * discount / 100), -2);
        //     } else {
        //         totalAmount = round2((amount - discount), -2);
        //     }
        //
        //     itemsCollection.update(
        //         {_id: itemId},
        //         {
        //             $set: {
        //                 memoItem: memoItem,
        //                 qty: qty,
        //                 price: price,
        //                 orderPrice: orderPrice,
        //                 discount: discount,
        //                 discountType: discountType,
        //                 amount: amount,
        //                 totalAmount: totalAmount,
        //                 memo: memo
        //             }
        //         }
        //     );
        // } else {
        itemsCollection.insert({
            // _id: itemId,
            itemId: itemId,
            itemName: itemName,
            memoItem: memoItem,
            qty: qty,
            unit: unit,
            currencyId: currency,
            price: price,
            purchasePrice: purchasePrice,
            khrPrice: khrPrice,
            orderPrice: orderPrice,
            discount: discount,
            discountType: discountType,
            amount: amount,
            totalAmount: totalAmount,
            memo: memo
        });
        // }
    }
});

// Edit
editTmpl.onCreated(function () {
    this.itemId = new ReactiveVar();
    this.itemDoc = new ReactiveVar();
    this.qty = new ReactiveVar(0);
    this.orderPrice = new ReactiveVar(0);
    this.price = new ReactiveVar(0);
    this.purchasePrice = new ReactiveVar(0);
    this.khrPrice = new ReactiveVar(0);
    this.amount = new ReactiveVar(0);
    this.currencyId = new ReactiveVar();
    this.discount = new ReactiveVar(0);
    this.discountType = new ReactiveVar();
    this.totalAmount = new ReactiveVar(0);

    this.autorun(() => {
        let data = Template.currentData();
        this.qty.set(data.qty);
        this.price.set(data.price);
        this.currencyId.set(data.currencyId);
        this.khrPrice.set(data.khrPrice);
        this.discount.set(data.discount);
        this.discountType.set(data.discountType);
    });
});

editTmpl.onRendered(function () {
    $('[name="currencyId"]').hide();
    $('[name="price"]').hide();
    $('[name="khrPrice"]').hide();
});

editTmpl.helpers({
    schema(){
        return OrderItemsSchema;
    },
    data: function () {
        let data = Template.currentData();
        return data;
    },
    orderPrice: function () {
        const instance = Template.instance();
        let result, exchangeDoc = Session.get('exchangeDoc'), customerType = Session.get('customerType');

        if (customerType == "Retail") {
            result = roundKhrCurrency(instance.khrPrice.get());
        } else {
            fx.base = "USD";
            fx.rates = {
                "KHR": exchangeDoc.rates.KHR,
                "USD": exchangeDoc.rates.USD,
                "THB": exchangeDoc.rates.THB
            }

            if (instance.currencyId.get() == "USD") {
                result = roundKhrCurrency(fx.convert(instance.price.get(), {from: "USD", to: "KHR"}));

            } else if (instance.currencyId.get() == "THB") {
                result = roundKhrCurrency(fx.convert(instance.price.get(), {from: "THB", to: "KHR"}));
            } else {
                result = roundKhrCurrency(instance.khrPrice.get());
            }
        }

        return result;
    },
    itemDoc: function () {
        return Template.instance().itemDoc.get();
    },
    amount: function () {
        const instance = Template.instance();
        let amount, data = Template.currentData(), exchangeDoc = Session.get('exchangeDoc'), customerType = Session.get('customerType'), orderPrice = instance.orderPrice.get();

        if (customerType == "Retail") {
            amount = roundKhrCurrency(instance.qty.get() * instance.khrPrice.get());
        } else {
            fx.base = "USD";
            fx.rates = {
                "KHR": exchangeDoc.rates.KHR,
                "USD": exchangeDoc.rates.USD,
                "THB": exchangeDoc.rates.THB
            };

            let tempAmount = instance.qty.get() * instance.price.get();

            if (instance.currencyId.get() == "USD") {
                amount = roundKhrCurrency(fx.convert(tempAmount, {from: "USD", to: "KHR"}));
            } else if (instance.currencyId.get() == "THB") {
                amount = roundKhrCurrency(fx.convert(tempAmount, {from: "THB", to: "KHR"}));
            } else if (instance.currencyId.get() == "KHR") {
                amount = roundKhrCurrency(instance.qty.get() * instance.khrPrice.get()) || roundKhrCurrency(data.khrPrice);
            }
        }

        instance.amount.set(orderPrice > 0 ? instance.qty.get() * orderPrice : amount);
        return orderPrice > 0 ? roundKhrCurrency(instance.qty.get() * orderPrice) : amount;
    },
    totalAmount: function () {
        const instance = Template.instance();
        let totalAmount, amount = instance.amount.get(), discount = instance.discount.get(), discountType = Session.get('discountType');

        if (discountType == "Percentage" || discountType == "%") {
            totalAmount = roundKhrCurrency(amount - (amount * discount / 100));
        } else {
            totalAmount = roundKhrCurrency((amount - discount));
        }
        return totalAmount;
    },
    discountType(){
        let result;
        if (!_.isNull(Session.get('discountType'))) {
            result = Session.get('discountType') == "Amount" ? "៛" : "%";
        }

        return result;
    }
});

editTmpl.events({
    'change [name="itemId"]': function (event, instance) {
        let itemId = event.currentTarget.value;

        // Check item value
        if (itemId) {
            // $.blockUI();
            lookupItem.callPromise({
                itemId: itemId
            }).then((result) => {
                if (_.isUndefined(result.purchase)) {
                    result.purchase = 0;
                }
                instance.price.set(result.price);
                instance.khrPrice.set(result.khrPrice);
                instance.currencyId.set(result.currencyId);
                instance.itemDoc.set(result);
                Session.set("image", result.photo);
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

        //animate for member
        $('#animation').removeClass().addClass('animated bounceIn').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            $(this).removeClass('animated bounceIn');
        });
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
        // Check old item
        if (insertDoc.itemId == currentDoc.itemId) {
            itemsCollection.update(
                {_id: currentDoc._id},
                updateDoc
            );
        } else {
            itemsCollection.remove({_id: currentDoc._id});

            // Check exist item
            let exist = itemsCollection.findOne({_id: insertDoc._id});
            if (exist) {
                let newQty = exist.qty + insertDoc.qty;
                let newAmount = round2(newQty * insertDoc.orderPrice, 2);
                let discountType = Session.get('discountType') == "Percentage" ? "%" : "៛";
                let newTotalAmount, newDiscount = insertDoc.discount;
                if (discountType == "%") {
                    newTotalAmount = roundKhrCurrency(newAmount - (newAmount * newDiscount / 100));
                } else {
                    newTotalAmount = roundKhrCurrency((newAmount - newDiscount));
                }

                itemsCollection.update(
                    {_id: insertDoc._id},
                    {
                        $set: {
                            qty: newQty,
                            unit: insertDoc.unit,
                            currencyId: insertDoc.currencyId,
                            price: insertDoc.price,
                            purchasePrice: insertDoc.purchasePrice,
                            khrPrice: insertDoc.khrPrice,
                            orderPrice: insertDoc.orderPrice,
                            discount: newDiscount,
                            discountType: discountType,
                            amount: newAmount,
                            totalAmount: newTotalAmount,
                            memo: insertDoc.memo
                        }
                    }
                );
            } else {
                let itemName = Session.get('update') == true ? _.split($('[name="itemId"] option:selected').text(), " : ")[1] : _.split($('[name="itemId"] option:selected').text(), " : ")[2];
                let discountType = Session.get('discountType') == "Percentage" ? "%" : "៛";

                itemsCollection.insert({
                    _id: currentDoc._id,
                    itemId: insertDoc.itemId,
                    itemName: itemName,
                    qty: insertDoc.qty,
                    unit: insertDoc.unit,
                    currencyId: insertDoc.currencyId,
                    price: insertDoc.price,
                    purchasePrice: insertDoc.purchasePrice,
                    khrPrice: insertDoc.khrPrice,
                    orderPrice: insertDoc.orderPrice,
                    discount: insertDoc.discount,
                    discountType: discountType,
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
AutoForm.addHooks(['Moto_orderItemsEdit'], hooksObject);
