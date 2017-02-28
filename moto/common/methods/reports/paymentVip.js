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
import {OrderVipPayment} from '../../collections/orderVipPayment';

export const paymentVipReport = new ValidatedMethod({
    name: 'moto.paymentVipReport',
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
                paidDate: {$gte: fDate, $lte: tDate},
            };

            rptContent = OrderVipPayment.aggregate([
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
                        from: "moto_employee",
                        localField: "employeeId",
                        foreignField: "_id",
                        as: "employeeDoc"
                    }
                },
                {
                    $unwind: "$employeeDoc"
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
                // { $sort: { paidDate: -1 } },
                {
                    $group: {
                        _id: {
                            day: { $dayOfMonth: "$paidDate" },
                            month: { $month: "$paidDate" },
                            year: { $year: "$paidDate" },
                            branchId: "$branchId"
                        },
                        paidDate: { $last: "$paidDate" },
                        customerDoc: { $last: "$customerDoc" },
                        employeeDoc: { $last: "$employeeDoc" },
                        branchDoc: { $last: "$branchDoc" },
                        dueAmountKhr: { $sum: "$dueAmountKhr" },
                        paidAmountKhr: { $sum: "$paidAmountKhr" },
                        paymentBalanceKhr: { $sum: "$paymentBalanceKhr" },
                        dueAmountUsd: { $sum: "$dueAmountUsd" },
                        paidAmountUsd: { $sum: "$paidAmountUsd" },
                        paymentBalanceUsd: { $sum: "$paymentBalanceUsd" },
                        dueAmountThb: { $sum: "$dueAmountUsd" },
                        paidAmountThb: { $sum: "$paidAmountUsd" },
                        paymentBalanceThb: { $sum: "$paymentBalanceUsd" },
                        dataPaymentVip: { $push: "$$ROOT" },
                    }
                },
                { $sort: { paidDate: -1 } },
                {
                    $project: {
                        _id: 0,
                        branchId: "$_id.branchId",
                        customerDoc: 1,
                        employeeDoc: 1,
                        branchDoc: 1,
                        paidDate: 1,
                        dueAmountKhr: 1,
                        paidAmountKhr: 1,
                        paymentBalanceKhr: 1,
                        dueAmountUsd: 1,
                        paidAmountUsd: 1,
                        paymentBalanceUsd: 1,
                        dueAmountThb: 1,
                        paidAmountThb: 1,
                        paymentBalanceThb: 1,
                        dataPaymentVip: 1
                    }
                },
                {
                    $group: {
                        _id: "$branchId",
                        paidDate: { $last: "$paidDate" },
                        branchDoc: { $last: "$branchDoc" },
                        dueAmountKhr: { $sum: "$dueAmountKhr" },
                        paidAmountKhr: { $sum: "$paidAmountKhr" },
                        paymentBalanceKhr: { $sum: "$paymentBalanceKhr" },
                        dueAmountUsd: { $sum: "$dueAmountUsd" },
                        paidAmountUsd: { $sum: "$paidAmountUsd" },
                        paymentBalanceUsd: { $sum: "$paymentBalanceUsd" },
                        dueAmountThb: { $sum: "$dueAmountThb" },
                        paidAmountThb: { $sum: "$paidAmountThb" },
                        paymentBalanceThb: { $sum: "$paymentBalanceThb" },
                        dataDate: { $push: "$$ROOT" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        dueAmountKhr: { $sum: "$dueAmountKhr" },
                        paidAmountKhr: { $sum: "$paidAmountKhr" },
                        paymentBalanceKhr: { $sum: "$paymentBalanceKhr" },
                        dueAmountUsd: { $sum: "$dueAmountUsd" },
                        paidAmountUsd: { $sum: "$paidAmountUsd" },
                        paymentBalanceUsd: { $sum: "$paymentBalanceUsd" },
                        dueAmountThb: { $sum: "$dueAmountThb" },
                        paidAmountThb: { $sum: "$paidAmountThb" },
                        paymentBalanceThb: { $sum: "$paymentBalanceThb" },
                        dataBranch: { $push: "$$ROOT" }
                    }
                }
            ])[0];
            return {rptTitle, rptHeader, rptContent};
        }
    }
});
