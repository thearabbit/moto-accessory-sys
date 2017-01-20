import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {FlowRouter} from 'meteor/kadira:flow-router';
import {AutoForm} from 'meteor/aldeed:autoform';
// import {sAlert} from 'meteor/juliancwirko:s-alert';
import {Bert} from 'meteor/themeteorchef:bert';
import 'meteor/theara:autoprint';
import 'printthis';
import {_} from 'meteor/erasaur:meteor-lodash';

// Lib
import {displaySuccess, displayError} from '../../../core/client/libs/display-alert.js';
import {selectElementContents}  from '../../../moto/common/libs/selectAndCopy';

// Component
import '../../../core/imports/layouts/report/content.html';
import '../../../core/imports/layouts/report/sign-footer.html';
import '../../../core/client/components/loading.js';
import '../../../core/client/components/form-footer.js';

// Method
import {itemListReport} from '../../common/methods/reports/itemList.js';

// Page
import './itemList.html';

// Declare template
let indexTmpl = Template.Moto_itemListReport;

// Index
indexTmpl.onCreated(function () {
    this.rptInit = new ReactiveVar(true);
    this.rptData = new ReactiveVar();

    this.autorun(() => {
        // Report Data
        itemListReport.callPromise()
            .then((result)=> {
                this.rptData.set(result);
            }).catch((err)=> {
                console.log(err.message);
            }
        );
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
    },
    addSpace(ancestors){
        let num = _.isArray(ancestors) ? ancestors.length : 0;
        return Spacebars.SafeString(_.repeat('&nbsp;', num * 5));
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
    $(document).off('keyup');
});