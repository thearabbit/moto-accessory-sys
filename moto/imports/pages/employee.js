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
import {Employee} from '../../common/collections/employee.js';

// Tabular
import {EmployeeTabular} from '../../common/tabulars/employee.js';

// Page
import './employee.html';

// Declare template
let indexTmpl = Template.Moto_employee,
    contactTmpl = Template.Moto_employeeContact,
    formTmpl = Template.Moto_employeeForm,
    showTmpl = Template.Moto_employeeShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('employee', {size: 'lg'});
    createNewAlertify('employeeShow',);
});

indexTmpl.helpers({
    tabularTable(){
        return EmployeeTabular;
    },
    selector() {
        return {branchId: Session.get('currentByBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.employee(fa('plus', 'Employee'), renderTemplate(formTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.employee(fa('pencil', 'Employee'), renderTemplate(formTmpl, {employeeId: this._id}));
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            Employee,
            {_id: this._id},
            {title: 'Employee', itemTitle: this._id}
        );
    },
    'click .js-display' (event, instance) {
        alertify.employeeShow(fa('eye', 'Employee'), renderTemplate(showTmpl, {employeeId: this._id}));
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
        this.subscribe('moto.lookupValue', ['Gender', 'Contact Type', 'Employee Position']);

        let currentData = Template.currentData();
        if (currentData) {
            this.subscribe('moto.employeeById', currentData.employeeId);
        }
    });
});

formTmpl.helpers({
    collection(){
        return Employee;
    },
    data () {
        let data = {
            formType: 'insert',
            doc: {}
        };
        let currentData = Template.currentData();

        if (currentData) {
            data.formType = 'update';
            data.doc = Employee.findOne(currentData.employeeId);
        }

        return data;
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        let currentData = Template.currentData();
        this.subscribe('moto.employeeById', currentData.employeeId);
    });
});

showTmpl.helpers({
    data () {
        let currentData = Template.currentData();
        return Employee.findOne(currentData.employeeId);
    },
    jsonViewOpts () {
        return {collapsed: true};
    }
});

// Hook
let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.employee().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Moto_employeeForm'], hooksObject);
