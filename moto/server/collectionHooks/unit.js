import 'meteor/matb33:collection-hooks';
import {idGenerator} from 'meteor/theara:id-generator';

// Collection
import {Unit} from '../../common/collections/unit.js';

Unit.before.insert(function (userId, doc) {
    doc._id = idGenerator.gen(Unit, 2);
});
