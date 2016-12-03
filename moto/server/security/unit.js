import {Unit} from '../../common/collections/unit.js';

// Config
import '../configs/security.js';

Unit.permit(['insert'])
    .Moto_ifDataInsert()
    .allowInClientCode();
Unit.permit(['update'])
    .Moto_ifDataUpdate()
    .allowInClientCode();
Unit.permit(['remove'])
    .Moto_ifDataRemove()
    .allowInClientCode();
