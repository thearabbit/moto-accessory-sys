import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/common/collections/company';
import {Item} from '../../collections/item';

export const itemListReport = new ValidatedMethod({
    name: 'moto.itemListReport',
    mixins: [CallPromiseMixin],
    validate: null,
    run() {
        if (!this.isSimulation) {
            Meteor._sleepForMs(2000);

            let rptTitle, rptHeader, rptContent;

            // --- Title ---
            rptTitle = Company.findOne();

            // --- Content ---
            rptContent = Item.aggregate([
                {
                    $lookup: {
                        from: "moto_unit",
                        localField: "unitId",
                        foreignField: "_id",
                        as: "unitDoc"
                    }
                },
                { $unwind: { path: "$unitDoc", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        code: 1,
                        name: 1,
                        currencyId: 1,
                        currency: {
                            $cond: {
                                if: { $eq: ["$currencyId", "KHR"] },
                                then: "៛",
                                else: {
                                    $cond: { if: { $eq: ["$currencyId", "USD"] }, then: " $", else: "B" }
                                }
                            }
                        },
                        price: 1,
                        khrPrice: 1,
                        type: 1,
                        unitDoc: 1

                    }
                },
                {$sort: {_id: 1}}
            ]);

            return {rptTitle, rptHeader, rptContent};
        }
    }
});
