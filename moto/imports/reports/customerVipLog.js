import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {AutoForm} from 'meteor/aldeed:autoform';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import 'meteor/theara:autoprint';
import 'printthis';

// Lib
import {displaySuccess, displayError} from '../../../core/client/libs/display-alert.js';
import {selectElementContents}  from '../../../moto/common/libs/selectAndCopy';

// Component
import '../../../core/imports/layouts/report/content.html';
import '../../../core/imports/layouts/report/sign-footer.html';
import '../../../core/client/components/loading.js';
import '../../../core/client/components/form-footer.js';

// Method
import {customerVipLogReport} from '../../common/methods/reports/customerVipLog.js';

// Schema
import {CustomerVipLogSchema} from '../../common/collections/reports/customerVipLog.js';

// Page
import './customerVipLog.html';

// Declare template
let indexTmpl = Template.Moto_customerVipLogReport;

// State
let formDataState = new ReactiveVar(null);

// Index
indexTmpl.onCreated(function () {
    this.rptInit = new ReactiveVar(false);
    this.rptData = new ReactiveVar(null);

    this.autorun(() => {
        // Report Data
        if (formDataState.get()) {
            this.rptInit.set(true);
            this.rptData.set(false);

            customerVipLogReport.callPromise(formDataState.get())
                .then((result)=> {
                    console.log(result);
                    this.rptData.set(result);
                }).catch((err)=> {
                    console.log(err.message);
                }
            );
        }

    });

    $(document).on('keyup', (e) => {
        if (e.keyCode == 67) {
            selectElementContents(document.getElementById('item-list-tbl'));

            document.execCommand('copy');
            Bert.alert({
                type: 'custom-success',
                style: 'fixed-bottom',
                title: 'Copy',
                message: 'Completed',
                icon: 'fa-files-o'
            });
        }
    });
});

indexTmpl.helpers({
    schema(){
        return CustomerVipLogSchema;
    },
    rptInit(){
        let instance = Template.instance();
        return instance.rptInit.get();
    },
    rptData: function () {
        let instance = Template.instance();
        return instance.rptData.get();
    },
    increaseIndex(index){
        return index += 1;
    }
});

indexTmpl.events({
    'click .btn-print-this'(event, instance){
        // Print This Package
        let opts = {
            // debug: true,               // show the iframe for debugging
            // importCSS: true,            // import page CSS
            // importStyle: true,         // import style tags
            // printContainer: true,       // grab outer container as well as the contents of the selector
            // loadCSS: "path/to/my.css",  // path to additional css file - us an array [] for multiple
            // pageTitle: "",              // add title to print page
            // removeInline: false,        // remove all inline styles from print elements
            // printDelay: 333,            // variable print delay; depending on complexity a higher value may be necessary
            // header: null,               // prefix to html
            // formValues: true            // preserve input/form values
        };

        $('#print-data').printThis(opts);
    },
    'click .btn-print-area'(event, instance){
        // Print Area Package
        let opts = {
            //
        };

        $('#print-data').printArea(opts);
    },
    'click .btn-tip'(event, instance){
        Bert.alert({
            type: 'info',
            style: 'fixed-bottom',
            title: 'Tip',
            message: 'Press "C" For Copy',
            icon: 'fa-lightbulb-o'
        });
    }
});

indexTmpl.onDestroyed(function () {
    formDataState.set(null);
});

// hook
let hooksObject = {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
        this.event.preventDefault();
        formDataState.set(null);

        this.done(null, insertDoc);
    },
    onSuccess: function (formType, result) {
        formDataState.set(result);
    },
    onError: function (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks('Moto_customerVipLogReport', hooksObject);
