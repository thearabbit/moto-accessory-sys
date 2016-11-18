// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by jsonview.js.
import { name as packageName } from "meteor/jsonview";

// Write your tests here!
// Here is an example.
Tinytest.add('jsonview - example', function (test) {
  test.equal(packageName, "jsonview");
});
