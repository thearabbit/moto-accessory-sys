import {Order} from '../../common/collections/order.js';

// Config
import '../configs/security.js';

Order.permit(['insert'])
    .Moto_ifDataInsert()
    .allowInClientCode();
Order.permit(['update'])
    .Moto_ifDataUpdate()
    .allowInClientCode();
Order.permit(['remove'])
    .Moto_ifDataRemove()
    .allowInClientCode();
