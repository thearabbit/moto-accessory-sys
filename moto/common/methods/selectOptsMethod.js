import {Meteor} from 'meteor/meteor';
import {ValidatedMethod} from 'meteor/mdg:validated-method';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {_} from 'meteor/erasaur:meteor-lodash';
import {moment} from  'meteor/momentjs:moment';

// Collection
import {Exchange} from '../../../core/common/collections/exchange';
import {Customer} from '../collections/customer';
import {Employee} from '../collections/employee';
import {Item} from '../collections/item';
import {Location} from '../collections/location';
import {Order} from '../collections/order';
import {OrderVip} from '../collections/orderVip';
import {Supplier} from '../collections/supplier';

export let SelectOptsMethod = {};

// Location
SelectOptsMethod.location = new ValidatedMethod({
    name: 'moto.selectOptsMethod.location',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};

            if (searchText) {
                selector = {
                    $or: [
                        {code: {$regex: searchText, $options: 'i'}},
                        {name: {$regex: searchText, $options: 'i'}}
                    ],
                };
            } else if (values.length) {
                selector = {_id: {$in: values}};
            }
            _.assignIn(selector, params);

            let data = Location.aggregate([
                {
                    $match: selector
                },
                {
                    $limit: 10
                },
                {
                    $unwind: {path: "$ancestors", preserveNullAndEmptyArrays: true}
                },
                {
                    $lookup: {
                        from: "moto_location",
                        localField: "ancestors",
                        foreignField: "_id",
                        as: "ancestorsDoc"
                    }
                },
                {
                    $unwind: {path: "$ancestorsDoc", preserveNullAndEmptyArrays: true}
                },
                {
                    $group: {
                        _id: "$_id",
                        type: {$first: "$type"},
                        parent: {$first: "$parent"},
                        code: {$first: "$code"},
                        khName: {$first: "$khName"},
                        enName: {$first: "$enName"},
                        ancestorsDoc: {$push: "$ancestorsDoc.khName"}
                    }
                }
            ]);

            data.forEach(function (value) {
                let label = `${value.code} : `;
                if (_.compact(value.ancestorsDoc).length > 0) {
                    _.forEach(value.ancestorsDoc, (o) => {
                        label += o + ', ';
                    })
                }
                label += value.khName;

                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

// Item
SelectOptsMethod.item = new ValidatedMethod({
    name: 'moto.selectOptsMethod.item',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};

            if (searchText) {
                selector = {
                    $or: [
                        {code: {$regex: searchText, $options: 'i'}},
                        {name: {$regex: searchText, $options: 'i'}}
                    ]
                };
            } else if (values.length) {
                selector = {_id: {$in: values}};
            }
            _.assignIn(selector, params);

            let data = Item.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = `${value.code} : ${value.name}`;
                if (value.ancestors) {
                    let getAncestors = Item.find({_id: {$in: value.ancestors}}, {sort: {_id: 1}}).fetch();
                    label += ' [' + _.map(getAncestors, (o) => {
                            return o.name;
                        }) + ']';
                }

                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

SelectOptsMethod.customer = new ValidatedMethod({
    name: 'moto.selectOptsMethod.customer',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};

            if (searchText && params.branchId) {
                selector = {
                    $or: [
                        {_id: {$regex: searchText, $options: 'i'}},
                        {name: {$regex: searchText, $options: 'i'}}
                    ],
                    branchId: params.branchId,

                };
            } else if (values.length) {
                selector = {_id: {$in: values}};
            }
            else if (params.type) {
                selector = {type: params.type};
            }

            let data = Customer.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = value._id + ' : ' + value.name;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

SelectOptsMethod.customerForOrderPayment = new ValidatedMethod({
    name: 'moto.selectOptsMethod.customerForOrderPayment',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};

            if (searchText && params.branchId) {
                selector = {
                    $or: [
                        {_id: {$regex: searchText, $options: 'i'}},
                        {name: {$regex: searchText, $options: 'i'}}
                    ],
                    branchId: params.branchId
                };
            } else if (values.length) {
                selector = {_id: {$in: values}};
            }else if (params.type) {
                selector = {type: {$ne: params.type}};
            }


            let data = Customer.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = value._id + ' : ' + value.name;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

SelectOptsMethod.customerForOrderVipPayment = new ValidatedMethod({
    name: 'moto.selectOptsMethod.customerForOrderVipPayment',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};

            if (searchText && params.branchId) {
                selector = {
                    $or: [
                        {_id: {$regex: searchText, $options: 'i'}},
                        {name: {$regex: searchText, $options: 'i'}}
                    ],
                    branchId: params.branchId
                };
            } else if (values.length) {
                selector = {_id: {$in: values}};
            }else if (params.type) {
                selector = {type: {$eq: params.type}};
            }


            let data = Customer.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = value._id + ' : ' + value.name;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

SelectOptsMethod.employee = new ValidatedMethod({
    name: 'moto.selectOptsMethod.employee',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};

            if (searchText && params.branchId) {
                selector = {
                    $or: [
                        {_id: {$regex: searchText, $options: 'i'}},
                        {name: {$regex: searchText, $options: 'i'}}
                    ],
                    branchId: params.branchId
                };
            } else if (values.length) {
                selector = {_id: {$in: values}};
            }

            let data = Employee.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = value._id + ' : ' + value.name;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});


SelectOptsMethod.orderItem = new ValidatedMethod({
    name: 'moto.selectOptsMethod.orderItem',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;

            if (searchText) {
                selector = {
                    $or: [
                        {code: {$regex: searchText, $options: 'i'}},
                        {name: {$regex: searchText, $options: 'i'}}
                    ]
                };
            } else if (values.length) {
                selector = {_id: {$in: values}};
            }
            selector.type = 'I';

            let data = Item.find(selector, {limit: 200});
            data.forEach(function (value) {
                let label = `${value.code} : ${value.name}`;
                if (value.ancestors) {
                    let getAncestors = Item.find({_id: {$in: value.ancestors}}, {sort: {_id: 1}}).fetch();
                    label += ' [' + _.map(getAncestors, (o) => {
                            return o.name;
                        }) + ']';
                }

                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

SelectOptsMethod.order = new ValidatedMethod({
    name: 'moto.selectOptsMethod.order',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;

            if (searchText) {
                selector = {
                    _id: {$regex: searchText, $options: 'i'},
                    branchId: params.branchId
                };
            } else if (values.length) {
                selector = {_id: {$in: values}};
            }

            let data = Order.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = `${value._id} | Date: ` + moment(value.orderDate).format('DD/MM/YYYY') + ` | Amount: ` + `${value.total} ៛`;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

SelectOptsMethod.orderVip = new ValidatedMethod({
    name: 'moto.selectOptsMethod.orderVip',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;

            if (searchText) {
                selector = {
                    _id: {$regex: searchText, $options: 'i'},
                    branchId: params.branchId
                };
            } else if (values.length) {
                selector = {_id: {$in: values}};
            }

            let data = OrderVip.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = `${value._id} | Date: ` + moment(value.orderDate).format('DD/MM/YYYY') + ` | Amount: ` + `${value.total} ៛ : ${value.totalUsd} $ : ${value.totalThb} B`;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

SelectOptsMethod.exchange = new ValidatedMethod({
    name: 'moto.selectOptsMethod.exchange',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;

            if (searchText) {
                selector = {$text: {$search: searchText}};
            } else if (values.length) {
                selector = {_id: {$in: values}};
            }

            let data = Exchange.find(selector, {limit: 10});
            data.forEach(function (value) {
                var label = moment(value.exDate).format('DD/MM/YYYY') +
                    ' | ' + numeral(value.rates.USD).format('0,0.00') + ' $' +
                    ' = ' + numeral(value.rates.KHR).format('0,0.00') + ' ៛' + ' = ' +
                    numeral(value.rates.THB).format('0,0.00') + ' B';

                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

//Supplier
SelectOptsMethod.supplier = new ValidatedMethod({
    name: 'moto.selectOptsMethod.supplier',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};

            if (searchText && params.branchId) {
                selector = {
                    $or: [
                        {_id: {$regex: searchText, $options: 'i'}},
                        {name: {$regex: searchText, $options: 'i'}}
                    ],
                    branchId: params.branchId
                };
            } else if (values.length) {
                selector = {_id: {$in: values}};
            }

            let data = Supplier.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = value._id + ' : ' + value.name;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});

// Report
SelectOptsMethod.customerForReport = new ValidatedMethod({
    name: 'moto.selectOptsMethod.customerForReport',
    validate: null,
    run(options) {
        if (!this.isSimulation) {
            this.unblock();

            let list = [], selector = {};
            let searchText = options.searchText;
            let values = options.values;
            let params = options.params || {};

            if (searchText && params.branchId) {
                selector = {
                    $or: [
                        {_id: {$regex: searchText, $options: 'i'}},
                        {name: {$regex: searchText, $options: 'i'}}
                    ],
                    branchId: params.branchId
                };
            } else if (values.length) {
                selector = {_id: {$in: values}};
            }else if (params.type) {
                selector = {type: {$ne: params.type}};
            }


            let data = Customer.find(selector, {limit: 10});
            data.forEach(function (value) {
                let label = `${value._id}  :  ${value.name} (${value.type})`;
                list.push({label: label, value: value._id});
            });

            return list;
        }
    }
});
