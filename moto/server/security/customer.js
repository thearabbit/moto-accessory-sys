import {Customer} from '../../common/collections/customer.js';

// Config
import '../configs/security.js';

Customer.permit(['insert'])
    .Moto_ifDataInsert()
    .allowInClientCode();
Customer.permit(['update'])
    .Moto_ifDataUpdate()
    .allowInClientCode();
Customer.permit(['remove'])
    .Moto_ifDataRemove()
    .allowInClientCode();
