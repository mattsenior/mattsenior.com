/*!
 *
 *  Copyright © Matt Senior | http://mattsenior.com/
 *
 */
(function(window, document, undefined)
{
    'use strict';

    var $ = window.jQuery;

    // safe debugging
    var log = function(obj)
    {
        if (typeof window.console === 'object' && typeof window.console.log === 'function') {
            window.console.log(obj);
        }
    };

    window.MJS = (function()
    {

        var _init = 0, app = { };

        app.init = function()
        {
            if (_init++) {
                return;
            }

            app.$win    = $(window);
            app.$docEl  = $(document.documentElement);
            app.$bodyEl = $(document.body);

            app.LTIE9   = app.$docEl.hasClass('lt-ie9');

            app.$docEl.addClass('js-ready');
        };

        return app;

    })();

})(window, window.document);
