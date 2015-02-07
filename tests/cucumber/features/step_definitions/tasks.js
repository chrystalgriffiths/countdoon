var assert = require('assert');

module.exports = function(){

  var helper = this;

  this.Given(/^I am running the app$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      callback();
    });

  this.When(/^I navigate to the index page$/, function (callback) {
    helper.world.browser.
    url(helper.world.mirrorUrl).
    call(callback);
  });

  this.Then(/^I can see the heading "([^"]*)"$/, function (expectedHeading, callback) {
    helper.world.browser.
      getText('h2', function (error, actualHeading) {
        assert.equal(actualHeading, expectedHeading);
        callback();
      });
  });

  this.Then(/^I can see my completed tasks underneath the heading$/, function (arg1, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });
};