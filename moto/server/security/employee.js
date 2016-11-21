import {Employee} from '../../common/collections/employee.js';

// Config
import '../configs/security.js';

Employee.permit(['insert'])
    .Moto_ifDataInsert()
    .allowInClientCode();
Employee.permit(['update'])
    .Moto_ifDataUpdate()
    .allowInClientCode();
Employee.permit(['remove'])
    .Moto_ifDataRemove()
    .allowInClientCode();
