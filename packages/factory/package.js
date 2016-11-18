Package.describe({
    name: 'theara:factory',
    version: '0.1.1',
    // Brief, one-line summary of the package.
    summary: '',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.2.0.2');
    api.use('ecmascript');

    api.use([
        'underscore'
    ]);

    api.export('Factory');

    api.addFiles('factory.js');
});

Package.onTest(function (api) {
    api.use('ecmascript');
    api.use('tinytest');
    api.use('theara:factory');
    api.addFiles('factory-tests.js');
});
