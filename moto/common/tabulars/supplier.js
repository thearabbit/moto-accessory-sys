import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import Tabular from 'meteor/aldeed:tabular';
import {EJSON} from 'meteor/ejson';
import {moment} from 'meteor/momentjs:moment';
import {_} from 'meteor/erasaur:meteor-lodash';
import {numeral} from 'meteor/numeral:numeral';
import {lightbox} from 'meteor/theara:lightbox-helpers';

// Lib
import {tabularOpts} from '../../../core/common/libs/tabular-opts.js';

// Collection
import {Supplier} from '../collections/supplier.js';

// Page
Meteor.isClient && require('../../imports/pages/supplier.html');

let tabularData = _.assignIn(_.clone(tabularOpts), {
    name: 'moto.supplier',
    collection: Supplier,
    columns: [
        {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Moto_supplierAction},
        {data: "_id", title: "ID"},
        {data: "name", title: "Name"},
        // {data: "gender", title: "Gender"},
        {data: "companyName", title: "Company Name"},
        {data: 'contact', title: 'Contact'},
    ]
});

export const SupplierTabular = new Tabular.Table(tabularData);
