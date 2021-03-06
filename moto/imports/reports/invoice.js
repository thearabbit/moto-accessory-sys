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
import {roundKhrCurrency}  from '../../../moto/common/libs/roundKhrCurrency';

// Component
import '../../../core/imports/layouts/report/content.html';
import '../../../core/imports/layouts/report/sign-footer.html';
import '../../../core/client/components/loading.js';
import '../../../core/client/components/form-footer.js';

// Method
import {invoiceReport} from '../../common/methods/reports/invoice.js';

// Collection
import {Order} from '../../common/collections/order.js';

// Schema
import {InvoiceSchema} from '../../common/collections/reports/invoice.js';

// Page
import './invoice.html';

// Declare template
let indexTmpl = Template.Moto_invoiceReport,
    genTmpl = Template.Moto_invoiceReportGen;


// Form
indexTmpl.onCreated(function () {
    this.autorun(() => {
        // Subscribe data for form filter
    });
});

indexTmpl.helpers({
    schema(){
        return InvoiceSchema;
    },
});

// Form hook
let hooksObject = {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
        this.event.preventDefault();
        this.done(null, insertDoc);
    },
    onSuccess: function (formType, result) {
        let params = {};
        let queryParams = result;
        let path = FlowRouter.path("moto.invoiceReportGe", params, queryParams);

        window.open(path, '_blank');
    },
    onError: function (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks('Moto_invoiceReport', hooksObject);

// Generate
genTmpl.onCreated(function () {
    this.rptData = new ReactiveVar();

    this.autorun(()=> {
        let queryParams = FlowRouter.current().queryParams;
        queryParams.printId = Template.currentData().printId;

        invoiceReport.callPromise(queryParams)
            .then((result)=> {
                roundKhrCurrency(result.rptContent.total);
                roundKhrCurrency(result.rptContent.lastOrderBalance);
                roundKhrCurrency(result.rptContent.balance);
                roundKhrCurrency(result.rptContent.totalPaidAmount);
                roundKhrCurrency(result.rptContent.overDue);
                this.rptData.set(result);
            }).catch((err)=> {
                console.log(err.message);
            }
        );
    });
});

genTmpl.helpers({
    rptData(){
        return Template.instance().rptData.get();
    },
    increaseIndex(index){
        return index += 1;
    }
});

genTmpl.events({
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
    }
});
