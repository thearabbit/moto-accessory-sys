import {Template} from 'meteor/templating';
import {AutoForm} from 'meteor/aldeed:autoform';
import {Roles} from  'meteor/alanning:roles';
import {alertify} from 'meteor/ovcharik:alertifyjs';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {fa} from 'meteor/theara:fa-helpers';
import {lightbox} from 'meteor/theara:lightbox-helpers';
import {TAPi18n} from 'meteor/tap:i18n';

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

// Collection
import {Item} from '../../common/collections/item.js';

// Tabular
import {ItemTabular} from '../../common/tabulars/item.js';

// Page
import './item.html';

// Declare template
let indexTmpl = Template.Moto_item,
    actionTmpl = Template.Moto_itemAction,
    formTmpl = Template.Moto_itemForm,
    showTmpl = Template.Moto_itemShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('item', {size: 'lg'});
    createNewAlertify('itemShow');
});

indexTmpl.helpers({
    tabularTable(){
        return ItemTabular;
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.item(fa('plus', TAPi18n.__('moto.item.title')), renderTemplate(formTmpl)).maximize();
    },
    'click .js-update' (event, instance) {
        alertify.item(fa('pencil', TAPi18n.__('moto.item.title')), renderTemplate(formTmpl, {
            itemId: this._id,
            type: this.type
        })).maximize();
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            Item,
            {_id: this._id},
            {title: TAPi18n.__('moto.item.title'), itemTitle: this._id}
        );
    },
    'click .js-display' (event, instance) {
        alertify.itemShow(fa('eye', TAPi18n.__('moto.item.title')), renderTemplate(showTmpl, {itemId: this._id}));
    }
});

// Form
formTmpl.onCreated(function () {
    this.type = new ReactiveVar();

    this.autorun(() => {
        // Lookup value
        this.subscribe('moto.lookupValue', ['Item Type']);
        let currentData = Template.currentData();

        if (currentData) {
            this.type.set(currentData.type);
            this.subscribe('moto.itemById', currentData.itemId);
        }
    });
});

formTmpl.helpers({
    collection(){
        return Item;
    },
    data () {
        let data = {
            formType: 'insert',
            doc: {}
        };
        let currentData = Template.currentData();

        if (currentData) {
            data.formType = 'update';
            data.doc = Item.findOne(currentData.itemId);
        }

        return data;
    },
    showTypeObj(){
        let type = Template.instance().type.get();
        return type == 'I' ? true : false;
    }
});

formTmpl.events({
    'change [name="type"]'(event, instance){
        instance.type.set(instance.$(event.currentTarget).val());
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(() => {
        let currentData = Template.currentData();

        this.subscribe('moto.itemById', currentData.itemId);
    });
});

showTmpl.helpers({
    i18nLabel(label){
        let key = `moto.item.schema.${label}.label`;
        return TAPi18n.__(key);
    },
    data () {
        let currentData = Template.currentData();
        let data = Item.findOne(currentData.itemId);
        data.photoUrl = null;

        if (data.photo) {
            let img = Files.findOne(data.photo);
            if (img) {
                data.photoUrl = img.url();
            }
        }

        return data;
    }
});

// Hook
let hooksObject = {
    // before: {
    //     insert: function (doc) {
    //         // if (doc.code && doc.parent) {
    //         //     let parentCode = _.trim(_.split($('[name="parent"] option:selected').text(), " : ")[0]);
    //         //     doc.code = `${parentCode}${doc.code}`;
    //         // }
    //
    //         return doc;
    //     },
    //     update: function (doc) {
    //         // if (doc.$set.code && doc.$set.parent) {
    //         //     let parentCode = _.trim(_.split($('[name="parent"] option:selected').text(), " : ")[0]);
    //         //     doc.$set.code = parentCode + doc.$set.code;
    //         // }
    //
    //         return doc;
    //     }
    // },
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.item().close();
        }
        displaySuccess();

        $('[name="name"]').val('');
        $('[name="name"]').focus();
        $('[name="price"]').val('');
        $('[name="khrPrice"]').val('');
    },
    onError (formType, error) {
        displayError(error.message);
    },
    // docToForm: function (doc, ss) {
    //     doc.code = _.last(doc.code.match(/\d{2}/g));
    //     return doc;
    // },
};

AutoForm.addHooks(['Moto_itemForm'], hooksObject);
