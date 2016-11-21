import {Supplier} from '../../common/collections/supplier.js';

// Config
import '../configs/security.js';

Supplier.permit(['insert'])
    .Moto_ifDataInsert()
    .allowInClientCode();
Supplier.permit(['update'])
    .Moto_ifDataUpdate()
    .allowInClientCode();
Supplier.permit(['remove'])
    .Moto_ifDataRemove()
    .allowInClientCode();
