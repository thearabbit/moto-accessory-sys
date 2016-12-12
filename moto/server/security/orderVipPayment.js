import {OrderVipPayment} from '../../common/collections/orderVipPayment.js';

// Config
import '../configs/security.js';

OrderVipPayment.permit(['insert'])
    .Moto_ifDataInsert()
    .allowInClientCode();
OrderVipPayment.permit(['update'])
    .Moto_ifDataUpdate()
    .allowInClientCode();
OrderVipPayment.permit(['remove'])
    .Moto_ifDataRemove()
    .allowInClientCode();
