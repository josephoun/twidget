// Import the TWidget class
import TWidget from './twidget.js';

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
global.document = dom.window.document;

describe('TWidget', () => {
  describe('build', () => {
    let twidget = new TWidget();

    beforeEach(() => {
      twidget = new TWidget('publisherid', 'apptype', 'apikey');
    })

    test('constructor should set properties', () => {
      expect(twidget).toBeDefined();
      expect(twidget.containers).toEqual([]);
      expect(twidget.sourceid).toEqual('214321562187');
      expect(twidget.url).toEqual('http://api.taboola.com/1.0/json/publisherid/recommendations.get?app.type=apptype&app.apikey=apikey&source.url=http://www.site.com/videos/214321562187.html');
    });

    test('it should register containers to twidget', () => {
      const widgetDetails = {
          elementId: 'mock_container',
          type: 'video',
          count: 5,
          template: () => {},
      };
      
      twidget.register(widgetDetails.elementId, widgetDetails.type, widgetDetails.count, widgetDetails.template).then(()=>{});
      expect(twidget.containers).toHaveLength(1);
      expect(twidget.containers[0]).toMatchObject(widgetDetails)
    });

    test('buildUrl should return the correct url', () => {
      const widgetDetails = {
        elementId: 'widget1',
        type: 'video',
        count: 5,
        template: () => {},
      };
      const expectedUrl = `http://api.taboola.com/1.0/json/publisherid/recommendations.get?app.type=apptype&app.apikey=apikey&source.url=http://www.site.com/videos/${twidget.sourceid}.html&count=${widgetDetails.count}&source.type=${widgetDetails.type}&source.id=${twidget.sourceid}`;
      const actualUrl = twidget.buildUrl(widgetDetails);
      expect(actualUrl).toEqual(expectedUrl);
    });
    
    test('buildWidget should set innerHTML and resolve promise', () => {
      const div = document.createElement('div');
      const data = {
        list: [
          {
            origin: 'organic',
            url: 'http://example.com',
            thumbnail: [{ url: 'http://example.com/image.jpg' }],
            name: 'Example',
            branding: 'Example Brand',
            type: 'video',
          },
        ],
      };
      const template = () => {};
      const resolved = jest.fn();
      twidget.buildWidget(div, data, template, resolved);
      expect(div.innerHTML).not.toEqual('');
      expect(resolved).toHaveBeenCalledWith(div);
    });

    test('generateItemDetails should return normalized item info', () => {
      const item = {
        origin: 'organic',
        url: 'http://example.com',
        thumbnail: [{ url: 'http://example.com/image.jpg' }],
        name: 'Example',
        branding: 'Example Brand',
        type: 'video',
      };
      const expected = {
        origin: 'organic',
        url: 'http://example.com',
        thumbnail: 'http://example.com/image.jpg',
        name: 'Example',
        branding: 'Example Brand',
        type: 'video',
      };
      const actual = twidget.generateItemDetails(item);
      expect(actual).toEqual(expected);
    });

  });
});
