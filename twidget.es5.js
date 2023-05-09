"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Taboola Recommendation Widget (1.0.0)
 */
var TWidget = function () {

    /**
     * Initialize the widget
     * @param {string} publisherid 
     * @param {string} apptype 
     * @param {string} apikey 
     */
    function TWidget(publisherid, apptype, apikey) {
        _classCallCheck(this, TWidget);

        this.containers = [];
        this.sourceid = '214321562187';
        this.url = "http://api.taboola.com/1.0/json/" + publisherid + "/recommendations.get?app.type=" + apptype + "&app.apikey=" + apikey + "&source.url=http://www.site.com/videos/" + this.sourceid + ".html";
    }

    /**
     * Register a T widget container
     * @param {string} elementId The widget container id.
     * @param {string} type The widget item type. 
     * @param {integer} count The widget max items count.
     * @param {function} template The widget item template (optional). Can be customized to enable different template types.
     */


    _createClass(TWidget, [{
        key: "register",
        value: function register(elementId, type, count, template) {
            // Attach template function if the published hasn't provided one to the widget
            if (!template) template = this.generateWidgetItem;

            // WOULD ADD TYPES in the future to make sure this object is being tested properly
            var widgetDetails = {
                elementId: elementId,
                type: type,
                count: count,
                template: template
            };

            this.containers.push(widgetDetails);

            // Enable users to react to changes in widget
            return new Promise(function (resolved, rejected) {
                widgetDetails.resolved = resolved;
                widgetDetails.rejected = rejected;
            });
        }

        /**
         * Build widget
         */

    }, {
        key: "build",
        value: function build() {
            var _this = this;

            if (this.containers) {
                this.containers.forEach(function (info) {
                    var div = document.getElementById(info.elementId);
                    if (div) {
                        // Try to get the data for this widget from the cache
                        var cacheKey = _this.getCacheKey(info);
                        var cacheData = localStorage.getItem(cacheKey);
                        if (cacheData) {
                            // If there's data in the cache, use it to build the widget
                            _this.buildWidget(div, JSON.parse(cacheData), info.template, info.resolved);
                        } else {
                            fetch(_this.buildUrl(info)).then(function (response) {
                                response.json().then(function (data) {
                                    // Store the data in the cache for future use
                                    if (data.list && data.list.length) {
                                        localStorage.setItem(cacheKey, JSON.stringify(data));
                                    }

                                    _this.buildWidget(div, data, info.template, info.resolved);
                                }).catch(function (reason) {
                                    _this.logError("Failed to parse widget ' " + info.container + " ' data", reason, info.rejected);
                                });
                            }).catch(function (reason) {
                                _this.logError("Failed to fetch widget ' " + info.container + " '  data", reason, info.rejected);
                            });
                        }
                    } else {
                        _this.logError("Failed to find widget container element '" + info.container + "'", reason, info.rejected);
                    }
                });
            }
        }

        /**
         * Generates the cache key for a widget's data
         * @param {object} info The widget details
         */

    }, {
        key: "getCacheKey",
        value: function getCacheKey(info) {
            return "twidget_" + info.container + "_" + info.count + "_" + info.type;
        }

        /**
         * Builds url for current container
         * @param info 
         */

    }, {
        key: "buildUrl",
        value: function buildUrl(info) {
            return this.url + "&count=" + info.count + "&source.type=" + info.type + "&source.id=" + this.sourceid;
        }

        /**
         * Build the specific widget
         * @param {element} div 
         * @param {json} data 
         */

    }, {
        key: "buildWidget",
        value: function buildWidget(div, data, template, resolved) {
            var _this2 = this;

            var list = data.list;
            if (list) {
                var content = '';
                list.forEach(function (item) {
                    content += template(_this2.generateItemDetails(item));
                });

                // after preparing the template as a string, use innerHTML to render the content at once
                div.innerHTML = content;

                // If we need to resolve the widget promise
                if (resolved) resolved(div);
            }
        }

        /**
         * Normalizes item info to hide JSON implementation
         * @param {object} item 
         */

    }, {
        key: "generateItemDetails",
        value: function generateItemDetails(item) {
            return {
                origin: item.origin,
                url: item.url,
                thumbnail: item.thumbnail[0].url, // we may apply a fallback image
                name: item.name,
                branding: item.branding,
                type: item.type
            };
        }

        /**
         * Gets the normalized widget item info and returns a template
         * Note: this may easily extend different item types in the future
         * @param {object} item 
         */

    }, {
        key: "generateWidgetItem",
        value: function generateWidgetItem(item) {
            return "\n            <div class='widget-item'>\n                <a href=" + item.url + " target=" + (item.origin === 'sponsored' ? '_blank' : '_self') + ">\n                    <div class='widget-item-image' style='background-image:url(" + item.thumbnail + ")'></div>\n                    <div class=\"widget-item-caption\">" + item.name + "</div>\n                    " + (item.origin === 'sponsored' ? item.branding : '') + "\n                </a>\n            </div>\n        ";
        }

        /**
         * Logs widget errors
         * @param {string} message 
         * @param {string} reason 
         */

    }, {
        key: "logError",
        value: function logError(message, reason, rejected) {
            var text = "ERROR: " + message + " [reason= " + reason + "]";
            console.log(text);
            if (rejected) rejected(text);
        }
    }]);

    return TWidget;
}();

module.exports = TWidget;
