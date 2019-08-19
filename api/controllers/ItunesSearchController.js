/**
 * ItunesSearchController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var request = require('request');

module.exports = {
  /**
   * Below service takes search options and returns customized search results
   *
   * @param   {Object}  req  request object with search details
   *                         params include
   *                             term -> search parameter item
   * @param   {Object}  res  response object with customized search
   *
   * @return  {Object}       customized itunes response data
   */
  search(req, res) {
    const mediaAttributes = ['book', 'album', 'coached-audio', 'feature-movie',
      'interactive-booklet', 'music-video', 'pdf podcast', 'podcast-episode',
      'software-package', 'song', 'tv-episode', 'artist'
    ];

    const customAttributes = {
      id: 'trackId',
      name: 'trackName',
      artwork: 'artworkUrl100',
      genre: 'primaryGenreName',
      url: 'trackViewUrl',
    };

    let searchOptions = {
      searchTerm: req.param('term'),
      limit: req.param('limit') || process.env.LIMIT || 10,
      offset: req.param('offset') || process.env.OFFSET || 10
    };

    /**
     * _itunesSearchService makes service call to itunes to fetch search results
     * @param  {Function} callback callback function to handle the data
     */
    let _itunesSearchService = (callback) => {
      let url = 'http://itunes.apple.com/search?';
      let options = {
        url: url,
        method: 'GET',
        headers: {
          'content-type': 'application/json'
        }
      };

      url += `term=${searchOptions.searchTerm}`;
      url += `&limit=${searchOptions.limit}&offset=${searchOptions.offset}`;
      options.url = url;

      request(options, callback);
    };

    /**
     * _pushCustomData customizes the result from the search item based on the
     * custom attributes
     * @param  {[type]} searchItem search item from the search results
     * @param  {[type]} mediaResults resultant array
     */
    let _pushCustomData = (searchItem, mediaResults) => {
      let customizedSearchItem = {};
      for (let attribute in customAttributes) {
        customizedSearchItem[attribute] = searchItem[customAttributes[attribute]];
      }
      mediaResults[searchItem.kind].push(customizedSearchItem);
    };

    let _groupMediaResults = (responseData) => {
      let mediaResults = {};
      let searchData = responseData.results;
      for (let indx = 0; indx < searchData.length; indx++) {
        let searchItem = searchData[indx];
        if (searchItem.kind) {
          if (!(searchItem.kind in mediaResults)) {
            mediaResults[searchItem.kind] = [];
          }
          _pushCustomData(searchItem, mediaResults);
        }
      }
      return mediaResults;
    };

    /**
     * _successResponse handles success
     * @param  {[type]} data  customized data
     * @param  {[type]} count result count
     */
    _successResponse = (data, count) => {
      return res.status(400).json(
        '200', {
          data: {
            'searchTerm': searchOptions.searchTerm,
            'resultCount': count,
            'mediaResults': data,
          }
        });
    };

    /**
     * _errorResponse handles error response of the service
     * @param  {[type]} msg error message
     * @param  {[type]} err error object if any
     */
    _errorResponse = (msg, err) => {
      return res.status(400).json('400', {
        data: msg,
        error: err
      });
    };


    /**********************************/
    /* Controller handler starts here */
    /**********************************/
    if (searchOptions.searchTerm) {
      _itunesSearchService((err, response, body) => {
        let responseData = JSON.parse(response.body);
        if (responseData && responseData.resultCount) {
          try {
            _successResponse(_groupMediaResults(responseData), responseData.resultCount);
          } catch (e) {
            _errorResponse('Something Messed up!!', e);
          }

        } else {
          _errorResponse('Server is unable to return response for the input term', err);
        }
      });
    } else {
      _errorResponse('Search Term Missing');
    }

  },
};
