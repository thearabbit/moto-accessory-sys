import {Security} from 'meteor/ongoworks:security';
import {Roles} from 'meteor/alanning:roles';

// Setting
Security.defineMethod("Moto_ifSetting", {
    fetch: [],
    transform: null,
    allow (type, arg, userId) {
        return Roles.userIsInRole(userId, ['setting'], 'Moto');
    }
});

// Data Entry
Security.defineMethod("Moto_ifDataInsert", {
    fetch: [],
    transform: null,
    allow (type, arg, userId) {
        return Roles.userIsInRole(userId, ['data-insert'], 'Moto');
    }
});

Security.defineMethod("Moto_ifDataUpdate", {
    fetch: [],
    transform: null,
    allow (type, arg, userId) {
        return Roles.userIsInRole(userId, ['data-update'], 'Moto');
    }
});

Security.defineMethod("Moto_ifDataRemove", {
    fetch: [],
    transform: null,
    allow (type, arg, userId) {
        return Roles.userIsInRole(userId, ['data-remove'], 'Moto');
    }
});

// Report
Security.defineMethod("Moto_ifReporter", {
    fetch: [],
    transform: null,
    allow (type, arg, userId) {
        return Roles.userIsInRole(userId, ['reporter'], 'Moto');
    }
});
