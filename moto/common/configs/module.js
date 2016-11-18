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
            'moto_location'
        ],
        data: [
            'moto_customer',
            'moto_order'
        ]
    }
};
