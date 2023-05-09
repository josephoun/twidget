/**
 * Taboola Recommendation Widget (1.0.0)
 */
class TWidget { 

    /**
     * Initialize the widget
     * @param {string} publisherid 
     * @param {string} apptype 
     * @param {string} apikey 
     */
    constructor(publisherid, apptype, apikey) {
        this.containers = [];
        this.sourceid = '214321562187';
        this.url = `http://api.taboola.com/1.0/json/${publisherid}/recommendations.get?app.type=${apptype}&app.apikey=${apikey}&source.url=http://www.site.com/videos/${this.sourceid}.html`; 
    }

    /**
     * Register a T widget container
     * @param {string} elementId The widget container id.
     * @param {string} type The widget item type. 
     * @param {integer} count The widget max items count.
     * @param {function} template The widget item template (optional). Can be customized to enable different template types.
     */
    register(elementId, type, count, template) {
        // Attach template function if the published hasn't provided one to the widget
        if(!template) template = this.generateWidgetItem;

        // WOULD ADD TYPES in the future to make sure this object is being tested properly
        var widgetDetails = {
            elementId,
            type,
            count,
            template
        };

        this.containers.push(widgetDetails);

        // Enable users to react to changes in widget
        return new Promise(function(resolved, rejected) {
            widgetDetails.resolved = resolved;
            widgetDetails.rejected = rejected;
        });
    }

    /**
     * Build widget
     */
    build() {
        if (this.containers) {
            this.containers.forEach((info) => {
                var div = document.getElementById(info.elementId);
                if(div) {
                    // Try to get the data for this widget from the cache
                    var cacheKey = this.getCacheKey(info);
                    var cacheData = localStorage.getItem(cacheKey);
                    if(cacheData) {
                        // If there's data in the cache, use it to build the widget
                        this.buildWidget(div, JSON.parse(cacheData), info.template, info.resolved);
                    } else {
                        fetch(this.buildUrl(info)).then((response) => {
                            response.json().then((data) => {
                                // Store the data in the cache for future use
                                if (data.list && data.list.length) {
                                    localStorage.setItem(cacheKey, JSON.stringify(data));
                                }

                                this.buildWidget(div, data, info.template, info.resolved);
                            }).catch((reason) =>{
                                this.logError("Failed to parse widget ' " + info.container + " ' data", reason, info.rejected);
                            });
                        }).catch((reason) => {
                            this.logError("Failed to fetch widget ' " + info.container + " '  data", reason, info.rejected);
                        });
                    }
                }
                else {
                    this.logError("Failed to find widget container element '"+info.container+"'", reason, info.rejected);
                }
            });
        }
    }

    /**
     * Generates the cache key for a widget's data
     * @param {object} info The widget details
     */
    getCacheKey(info) {
        return `twidget_${info.container}_${info.count}_${info.type}`;
    }    

    /**
     * Builds url for current container
     * @param info 
     */
    buildUrl(info) {
        return `${this.url}&count=${info.count}&source.type=${info.type}&source.id=${this.sourceid}`;
    }

    /**
     * Build the specific widget
     * @param {element} div 
     * @param {json} data 
     */
    buildWidget(div, data, template, resolved){
        var list = data.list;
        if(list) {
            var content = '';
            list.forEach((item) => {
                content += template(this.generateItemDetails(item));
            });

            // after preparing the template as a string, use innerHTML to render the content at once
            div.innerHTML = content;

            // If we need to resolve the widget promise
            if(resolved) resolved(div);
        } 
    }

    /**
     * Normalizes item info to hide JSON implementation
     * @param {object} item 
     */
    generateItemDetails(item) {
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
    generateWidgetItem(item) {
        return `
            <div class='widget-item'>
                <a href=${item.url} target=${item.origin==='sponsored' ? '_blank' : '_self'}>
                    <div class='widget-item-image' style='background-image:url(${item.thumbnail})'></div>
                    <div class="widget-item-caption">${item.name}</div>
                    ${item.origin==='sponsored' ? item.branding : ''}
                </a>
            </div>
        `
    }

    /**
     * Logs widget errors
     * @param {string} message 
     * @param {string} reason 
     */
    logError(message, reason, rejected) {
        var text = `ERROR: ${message} [reason= ${reason}]`;
        console.log(text);
        if(rejected) rejected(text);
    }
}

module.exports = TWidget