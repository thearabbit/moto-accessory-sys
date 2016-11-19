import {Meteor} from 'meteor/meteor';
import {Item} from '../../common/collections/item';

Meteor.startup(function () {
    Item._ensureIndex({code: 1, name: 1, type: 1}, {sparse: 1, unique: 1});
});
