Module = typeof Module === 'undefined' ? {} : Module;

Module.Moto = {
    name: 'Moto',
    version: '2.0.0',
    summary: 'Moto is ...',
    roles: [
        'setting',
        'data-insert',
        'data-update',
        'data-remove',
        'reporter'
    ],
    dump: {
        setting: [
            'moto_item',
            'moto_employee',
            'moto_supplier',
            'moto_location',
            'moto_lookupValue',
            'moto_unit'
        ],
        data: [
            'moto_customer',
            'moto_order',
            'moto_orderPayment',
            'moto_orderVip',
            'moto_orderVipPayment'
        ]
    }
};
