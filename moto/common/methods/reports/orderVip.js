import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {CallPromiseMixin} from 'meteor/didericis:callpromise-mixin';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Company} from '../../../../core/common/collections/company';
import {Branch} from '../../../../core/common/collections/branch';
import {Exchange} from '../../../../core/common/collections/exchange';
import {Customer} from '../../collections/customer';
import {OrderVip} from '../../collections/orderVip';

export const orderVipReport = new ValidatedMethod({
    name: 'moto.orderVipReport',
    mixins: [CallPromiseMixin],
    validate: null,
    run(params) {
        if (!this.isSimulation) {
            Meteor._sleepForMs(100);

            let rptTitle, rptHeader, rptContent, rptFooter;

            let fDate = moment(params.repDate[0]).startOf('day').toDate();
            let tDate = moment(params.repDate[1]).endOf('day').toDate();

            // --- Title ---
            rptTitle = Company.findOne();

            // --- Header ---
            // Branch
            let branchDoc = Branch.find({_id: {$in: params.branchId}});
            params.branchHeader = _.map(branchDoc.fetch(), function (val) {
                return `${val._id} : ${val.enName}`;
            });

            // Exchange
            // let exchangeDoc = Exchange.findOne(params.exchangeId);
            // params.exchangeHeader = JSON.stringify(exchangeDoc.rates, null, ' ');
            params.exchangeHeader = "KHR";

            rptHeader = params;

            // --- Content ---
            let selector = {
                branchId: {$in: params.branchId},
                orderDate: {$gte: fDate, $lte: tDate},
            };

            rptContent = OrderVip.aggregate([
                {
                    $match: selector
                },
                {
                    $lookup: {
                        from: "moto_customer",
                        localField: "customerId",
                        foreignField: "_id",
                        as: "customerDoc"
                    }
                },
                {
                    $unwind: "$customerDoc"
                },
                {
                    $lookup: {
                        from: "core_branch",
                        localField: "branchId",
                        foreignField: "_id",
                        as: "branchDoc"
                    }
                },
                {
                    $unwind: "$branchDoc"
                },
                // {$sort: {orderDate: -1}},
                {
                    $group: {
                        _id: {
                            day: {$dayOfMonth: "$orderDate"},
                            month: {$month: "$orderDate"},
                            year: {$year: "$orderDate"},
                            branchId: "$branchId"
                        },
                        orderDate: {$last: "$orderDate"},
                        branchDoc: {$last: "$branchDoc"},
                        subTotal: {$sum: "$subTotal"},
                        discountAmount: {$sum: "$discountAmount"},
                        total: {$sum: "$total"},
                        lastOrderBalanceKhr: {$sum: "$lastOrderBalanceKhr"},
                        subTotalUsd: {$sum: "$subTotalUsd"},
                        discountAmountUsd: {$sum: "$discountAmountUsd"},
                        totalUsd: {$sum: "$totalUsd"},
                        lastOrderBalanceUsd : {$sum: "$lastOrderBalanceUsd"},
                        subTotalThb: {$sum: "$subTotalThb"},
                        discountAmountThb: {$sum: "$discountAmountThb"},
                        totalThb: {$sum: "$totalThb"},
                        lastOrderBalanceThb: {$sum: "$lastOrderBalanceThb"},
                        dataOrder: {$push: "$$ROOT"},
                    }
                },
                {$sort: {orderDate: -1}},
                {
                    $project: {
                        _id: 0,
                        branchId: "$_id.branchId",
                        branchDoc: 1,
                        orderDate: 1,
                        subTotal: 1,
                        discountAmount: 1,
                        total: 1,
                        lastOrderBalanceKhr:1,
                        subTotalUsd: 1,
                        discountAmountUsd: 1,
                        totalUsd: 1,
                        lastOrderBalanceUsd:1,
                        subTotalThb: 1,
                        discountAmountThb: 1,
                        totalThb: 1,
                        lastOrderBalanceThb:1,
                        dataOrder: 1
                    }
                },
                {
                    $group: {
                        _id: "$branchId",
                        orderDate: {$last: "$orderDate"},
                        branchDoc: {$last: "$branchDoc"},
                        subTotal: {$sum: "$subTotal"},
                        discountAmount: {$sum: "$discountAmount"},
                        total: {$sum: "$total"},
                        lastOrderBalanceKhr: {$sum: "$lastOrderBalanceKhr"},
                        subTotalUsd: {$sum: "$subTotalUsd"},
                        discountAmountUsd: {$sum: "$discountAmountUsd"},
                        totalUsd: {$sum: "$totalUsd"},
                        lastOrderBalanceUsd: {$sum: "$lastOrderBalanceUsd"},
                        subTotalThb: {$sum: "$subTotalThb"},
                        discountAmountThb: {$sum: "$discountAmountThb"},
                        totalThb: {$sum: "$totalThb"},
                        lastOrderBalanceThb: {$sum: "$lastOrderBalanceThb"},
                        dataDate: {$push: "$$ROOT"}
                    }
                },
                {
                    $group: {
                        _id: null,
                        subTotal: {$sum: "$subTotal"},
                        discountAmount: {$sum: "$discountAmount"},
                        total: {$sum: "$total"},
                        lastOrderBalanceKhr: {$sum: "$lastOrderBalanceKhr"},
                        subTotalUsd: {$sum: "$subTotalUsd"},
                        discountAmountUsd: {$sum: "$discountAmountUsd"},
                        totalUsd: {$sum: "$totalUsd"},
                        lastOrderBalanceUsd: {$sum: "$lastOrderBalanceUsd"},
                        subTotalThb: {$sum: "$subTotalThb"},
                        discountAmountThb: {$sum: "$discountAmountThb"},
                        totalThb: {$sum: "$totalThb"},
                        lastOrderBalanceThb: {$sum: "$lastOrderBalanceThb"},
                        dataBranch: {$push: "$$ROOT"}
                    }
                }
            ])[0];

            return {rptTitle, rptHeader, rptContent};
        }
    }
});
