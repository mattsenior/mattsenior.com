---
layout: article
title: "Quick tip: Behat Bookmarks"
---

I recently encountered a [Behat](http://behat.org) test scenario for searching a folder of documents, which looks a little like this:

```gherkin
Scenario: Search a sub-folder for non-existent document
    Given I am on the admin document list page
      And I have clicked the "Title" of "Reports" in the admin document list
     When I search for "pterodactyl" in the admin
     Then the admin record list should be empty
```

The user journey involves clicking into a sub-folder to view its contents, then searching through those contents. I want to assert that after submitting the search form, the user remains on the same page instead of being taken elsewhere.

Thanks to the [Mink Extension](https://github.com/Behat/MinkExtension) `MinkContext`, we can already check URLs:

```gherkin
Then I should be on "/admin/documents"
```

The problem, however, is that our sub-folder URL contains a numeric ID: `/admin/documents/{parentId}`, and because we use data fixtures for all test content, we don’t know what that ID is (and don’t want to).

We could match the URL against a regular expression to check a `parentId` exists, but without knowing the ID it wouldn’t be accurate enough.

I want a way to ‘bookmark’ the current page, regardless of its URL, then check that I’ve returned to that exact page in the future, like this:

```gherkin
When I bookmark this page as "Current page"
 And I take some action...
Then I should be back on the page I bookmarked as "Current page"
```

By storing a small array of bookmark names and URLs, this can be accommodated in our `FeatureContext`:

```php
<?php

use Behat\MinkExtension\Context\MinkContext;
use Behat\Behat\Context\Step\Then;

class FeatureContext extends MinkContext
{
    /**
     * @var array
     */
    protected $bookmarks = array();

    /**
     * @Given /^I (?:have bookmarked|bookmark) (?:this|the current) page as "(?P<bookmark>[^"]+)"$/
     */
    public function bookmarkThisPage($bookmark)
    {
        $this->bookmarks[$bookmark] = $this->getSession()->getCurrentUrl();
    }

    /**
     * @Then /^I should be(?: back)? on the page I bookmarked as "(?P<bookmark>[^"]+)"$/
     */
    public function shouldBeOnBookmark($bookmark)
    {
        if (!array_key_exists($bookmark, $this->bookmarks)) {
            throw new \Exception(sprintf('You haven’t yet created the bookmark: %s', $bookmark));
        }

        return new Then(sprintf('I should be on "%s"', $this->bookmarks[$bookmark]));
    }
}
```

So our final Gherkin scenario ended up like this:

```gherkin
Scenario: Search a sub-folder for non-existent document
    Given I am on the admin document list page
      And I have clicked the "Title" of "Reports" in the admin document list
      And I have bookmarked this page as "Reports contents"
     When I search for "pterodactyl" in the admin
     Then I should be on the page I bookmarked as "Reports contents"
      And the admin record list should be empty
```
