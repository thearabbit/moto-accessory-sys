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
import {Unit} from '../../common/collections/unit.js';

// Tabular
import {UnitTabular} from '../../common/tabulars/unit.js';

// Page
import './unit.html';

// Declare template
let indexTmpl = Template.Moto_unit,
    contactTmpl = Template.Moto_unitContact,
    formTmpl = Template.Moto_unitForm,
    showTmpl = Template.Moto_unitShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('unit', {size: 'sm'});
    createNewAlertify('unitShow',);
});

indexTmpl.helpers({
    tabularTable(){
        return UnitTabular;
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.unit(fa('plus', 'Unit'), renderTemplate(formTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.unit(fa('pencil', 'Unit'), renderTemplate(formTmpl, {unitId: this._id}));
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            Unit,
            {_id: this._id},
            {title: 'Unit', itemTitle: this._id}
        );
    },
    'click .js-display' (event, instance) {
        alertify.unitShow(fa('eye', 'Unit'), renderTemplate(showTmpl, {unitId: this._id}));
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
        this.subscribe('moto.lookupValue', ['Gender', 'Contact Type', 'Unit Position']);

        let currentData = Template.currentData();
        if (currentData) {
            this.subscribe('moto.unitById', currentData.unitId);
        }
    });
});

formTmpl.helpers({
    collection(){
        return Unit;
    },
    data () {
        let data = {
            formType: 'insert',
            doc: {}
        };
        let currentData = Template.currentData();

        if (currentData) {
            data.formType = 'update';
            data.doc = Unit.findOne(currentData.unitId);
        }

        return data;
    },
    checkForDescriptionField() {
        if (FlowRouter.current().route.name == "moto.unit") {
            return true;
        }
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        let currentData = Template.currentData();
        this.subscribe('moto.unitById', currentData.unitId);
    });
});

showTmpl.helpers({
    data () {
        let currentData = Template.currentData();
        return Unit.findOne(currentData.unitId);
    },
    jsonViewOpts () {
        return {collapsed: true};
    }
});

// Hook
let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.unit().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Moto_unitForm'], hooksObject);
