import {Meteor} from 'meteor/meteor';
import {Templet} from 'meteor/templating';
import Tabular from 'meteor/aldeed:tabular';
import {EJSON} from 'meteor/ejson';
import {moment} from 'meteor/momentjs:moment';
import {_} from 'meteor/erasaur:meteor-lodash';
import {numeral} from 'meteor/numeral:numeral';
import {lightbox} from 'meteor/theara:lightbox-helpers';
import {TAPi18n} from 'meteor/tap:i18n';

// Lib
import {tabularOpts} from '../../../core/common/libs/tabular-opts.js';

// Collection
import {Item} from '../collections/item.js';

// Page
Meteor.isClient && require('../../imports/pages/item.html');

let tabularData = _.assignIn(_.clone(tabularOpts), {
    name: 'moto.item',
    collection: Item,
    order: [[1, 'asc']],
    columns: [
        {title: '<i class="fa fa-bars"></i>', tmpl: Meteor.isClient && Template.Moto_itemAction},
        {
            data: "order",
            title: "Order",
            visible: false
        },
        {
            data: "code",
            title: "Code",
            render: function (val, type, doc) {
                let level = _.isArray(doc.ancestors) ? doc.ancestors.length : 0;
                level = Spacebars.SafeString(_.repeat('&nbsp;', level * 5));

                // Check type
                if (doc.type == 'I') {
                    return Spacebars.SafeString(`${level}<span class="text-green">${val}</span>`);
                }

                return `${level}${val}`;
            }
        },
        {
            data: "name",
            title: "Name",
        },
        {
            data: "price",
            title: "Price",
            render: function (val, type, doc) {
                if (doc.type == 'I') {
                    return `${doc.currencyId} ` + numeral(val).format('0,0.00') + ` [ ៛ ` + numeral(doc.khrPrice).format('0,0.00') + `]`;
                }
            }
        },
        {
            data: "type",
            title: "Type",
        },
        {
            data: "photo",
            title: "Photo",
            render: function (val, type, doc) {
                if (val) {
                    let img = Files.findOne(val);
                    if (img) {
                        return lightbox(img.url(), doc._id, doc.name);
                    }
                }

                return null;
            }
        },
    ],
    extraFields: ['currencyId', 'khrPrice', 'ancestors'],
});

export const ItemTabular = new Tabular.Table(tabularData);
