import {OrderPayment} from '../../common/collections/orderPayment.js';

// Config
import '../configs/security.js';

OrderPayment.permit(['insert'])
    .Moto_ifDataInsert()
    .allowInClientCode();
OrderPayment.permit(['update'])
    .Moto_ifDataUpdate()
    .allowInClientCode();
OrderPayment.permit(['remove'])
    .Moto_ifDataRemove()
    .allowInClientCode();
