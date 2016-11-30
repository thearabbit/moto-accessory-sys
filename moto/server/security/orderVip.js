import {OrderVip} from '../../common/collections/orderVip.js';

// Config
import '../configs/security.js';

OrderVip.permit(['insert'])
    .Moto_ifDataInsert()
    .allowInClientCode();
OrderVip.permit(['update'])
    .Moto_ifDataUpdate()
    .allowInClientCode();
OrderVip.permit(['remove'])
    .Moto_ifDataRemove()
    .allowInClientCode();
