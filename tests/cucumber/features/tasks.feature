Feature: Tasks Index Page

  As a user
  I want to view all of my tasks
  So that I can review them, delete them or do them again

  Scenario: Users can see completed tasks
    Given I am running the app
    When I navigate to the index page
    Then I can see the heading "Completed Tasks"
    And I can see my completed tasks underneath the heading