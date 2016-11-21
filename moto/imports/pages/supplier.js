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
import {Supplier} from '../../common/collections/supplier.js';

// Tabular
import {SupplierTabular} from '../../common/tabulars/supplier.js';

// Page
import './supplier.html';

// Declare template
let indexTmpl = Template.Moto_supplier,
    contactTmpl = Template.Moto_supplierContact,
    formTmpl = Template.Moto_supplierForm,
    showTmpl = Template.Moto_supplierShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('supplier', {size: 'lg'});
    createNewAlertify('supplierShow',);
});

indexTmpl.helpers({
    tabularTable(){
        return SupplierTabular;
    },
    selector() {
        return {branchId: Session.get('currentByBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.supplier(fa('plus', 'Supplier'), renderTemplate(formTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.supplier(fa('pencil', 'Supplier'), renderTemplate(formTmpl, {supplierId: this._id}));
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            Supplier,
            {_id: this._id},
            {title: 'Supplier', itemTitle: this._id}
        );
    },
    'click .js-display' (event, instance) {
        alertify.supplierShow(fa('eye', 'Supplier'), renderTemplate(showTmpl, {supplierId: this._id}));
    }
});

// Contact tabular
contactTmpl.helpers({
    jsonViewOpts () {
        return {collapsed: true};
    }
});

// Form
formTmpl.onCreated(function () {
    this.autorun(()=> {
        // Lookup value
        this.subscribe('moto.lookupValue', ['Gender', 'Contact Type', 'Supplier Position']);

        let currentData = Template.currentData();
        if (currentData) {
            this.subscribe('moto.supplierById', currentData.supplierId);
        }
    });
});

formTmpl.helpers({
    collection(){
        return Supplier;
    },
    data () {
        let data = {
            formType: 'insert',
            doc: {}
        };
        let currentData = Template.currentData();

        if (currentData) {
            data.formType = 'update';
            data.doc = Supplier.findOne(currentData.supplierId);
        }

        return data;
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        let currentData = Template.currentData();
        this.subscribe('moto.supplierById', currentData.supplierId);
    });
});

showTmpl.helpers({
    data () {
        let currentData = Template.currentData();
        return Supplier.findOne(currentData.supplierId);
    },
    jsonViewOpts () {
        return {collapsed: true};
    }
});

// Hook
let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.supplier().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Moto_supplierForm'], hooksObject);
