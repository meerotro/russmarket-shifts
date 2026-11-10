<?php

it('serves the SPA shell for any non-API path', function (string $path) {
    $this->withoutVite();

    $this->get($path)->assertOk()->assertSee('<div id="app"></div>', false);
})->with(['/', '/ui-kit', '/some/deep/link']);

it('does not swallow unknown API paths', function () {
    $this->getJson('/api/does-not-exist')->assertNotFound();
});
