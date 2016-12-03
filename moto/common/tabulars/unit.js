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
import {Unit} from '../collections/unit.js';

// Page
Meteor.isClient && require('../../imports/pages/unit.html');

let tabularData = _.assignIn(_.clone(tabularOpts), {
    name: 'moto.unit',
    collection: Unit,
    columns: [
        {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Moto_unitAction},
        {data: "_id", title: "ID"},
        {data: "name", title: "Name"},
        // {data: "gender", title: "Gender"},
        {data: "des", title: "Description"},
        // {data: 'contact', title: 'Contact', tmpl: Meteor.isClient && Template.Moto_unitContact},
    ]
});

export const UnitTabular = new Tabular.Table(tabularData);
