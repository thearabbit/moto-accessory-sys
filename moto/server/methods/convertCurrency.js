import {Meteor} from 'meteor/meteor';
import {Accounts} from 'meteor/accounts-base';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import fx from "money";

// Collection
import {Exchange} from '../../../core/common/collections/exchange.js';

Meteor.methods({
    convertCurrencyToUsd({amount, currencyId}) {

        let exchangeDoc = Exchange.findOne({}, {sort: {exDate: -1}}), result;

        fx.base = exchangeDoc.base;
        fx.rates = exchangeDoc.rates;

        result = fx.convert(amount, {
            from: currencyId,
            to: 'USD'
        });

        return result;

    }
});