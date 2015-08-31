'use strict';

import Reflux        from 'reflux';
import _             from 'lodash';

import GlobalActions from '../actions/GlobalActions';
import PlaylistAPI   from '../utils/PlaylistAPI';

const PlaylistsPageStore = Reflux.createStore({

  init() {
    this.playlists = {
      trending: [],
      newest: []
    };

    this.listenTo(GlobalActions.loadPlaylistsPage, this.loadPlaylists);
  },

  loadPlaylists(cb = function() {}) {
    let promises = [
      PlaylistAPI.getTrending(),
      PlaylistAPI.getNewest()
    ];

    Promise.all(promises).then((results) => {
      this.playlists = {
        trending: results[0] || [],
        newest: results[1] || []
      };
      cb(null, this.playlists);
      this.trigger(null, this.playlists);
    }).catch((err) => {
      cb(err);
      this.trigger(err);
    });
  }

});

export default PlaylistsPageStore;