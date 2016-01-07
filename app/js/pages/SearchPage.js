'use strict';

import React            from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import _                from 'lodash';
import {History}        from 'react-router';
import DocumentTitle    from 'react-document-title';

import Helpers          from '../utils/Helpers';
import PageControlBar   from '../components/PageControlBar';
import SearchBar        from '../components/SearchBar';
import TabBar           from '../components/TabBar';
import ListLink         from '../components/ListLink';
import Spinner          from '../components/Spinner';

var SearchPage = React.createClass({

  mixins: [History, LinkedStateMixin],

  propTypes: {
    children: React.PropTypes.object,
    currentUser: React.PropTypes.object,
    currentTrack: React.PropTypes.object,
    params: React.PropTypes.object,
    location: React.PropTypes.object,
    showContextMenu: React.PropTypes.func
  },

  getInitialState() {
    this.sources = this.props.location.query.sources ? this.props.location.query.sources.split(',') : ['bandcamp', 'soundcloud', 'youtube'];

    return {
      query: this.props.location.query.q ? this.props.location.query.q.replace(/(\+)|(%20)/gi, ' ') : '',
      searchBandcamp: _.indexOf(this.sources, 'bandcamp') !== -1,
      searchSoundCloud: _.indexOf(this.sources, 'soundcloud') !== -1,
      searchYouTube: _.indexOf(this.sources, 'youtube') !== -1
    };
  },

  componentDidUpdate(prevProps) {
    let haveNewQuery = this.props.location.query.q && this.props.location.query.q.length && prevProps.location.query.q !== this.props.location.query.q;

    if ( haveNewQuery ) {
      this.setState({ query: this.props.location.query.q });
    }
  },

  setSearchState(state = {}) {
    this.setState({
      error: state.error || null,
      loading: state.loading || false
    });
  },

  toggleBandcamp() {
    this.setState({
      searchBandcamp: !this.state.searchBandcamp
    }, () => {
      if ( this.state.searchBandcamp ) {
        this.sources.push('bandcamp');
      } else {
        this.sources = _.without(this.sources, 'bandcamp');
      }
      this.reloadPage();
    });
  },

  toggleSoundCloud() {
    this.setState({
      searchSoundCloud: !this.state.searchSoundCloud
    }, () => {
      if ( this.state.searchSoundCloud ) {
        this.sources.push('soundcloud');
      } else {
        this.sources = _.without(this.sources, 'soundcloud');
      }
      this.reloadPage();
    });
  },

  toggleYouTube() {
    this.setState({
      searchYouTube: !this.state.searchYouTube
    }, () => {
      if ( this.state.searchYouTube ) {
        this.sources.push('youtube');
      } else {
        this.sources = _.without(this.sources, 'youtube');
      }
      this.reloadPage();
    });
  },

  handleKeyPress(evt) {
    let keyCode = evt.keyCode || evt.which;

    if ( keyCode === '13' || keyCode === 13 ) {
      this.reloadPage();
    }
  },

  reloadPage(query = {}) {
    _.assign(query, {
      q: this.state.query,
      sources: this.sources.join(','),
      playlist: this.props.location.query.playlist
    });

    if ( !this.history.isActive('/search/tracks') ) {
      delete query.sources;
    }

    if ( this.state.query ) {
      this.history.replaceState(null, window.location.pathname, query);
    }
  },

  renderSpinner() {
    if ( true || this.state.loading ) {
      return (
        <Spinner size={18} />
      );
    }
  },

  renderTrackSearchOptions() {
    if ( this.history.isActive('/search/tracks') ) {
      return (
        <ul>
          <li>
            <input type="checkbox"
                   id="bandcamp"
                   checked={this.state.searchBandcamp}
                   onChange={this.toggleBandcamp} />
            <label htmlFor="bandcamp">Bandcamp</label>
          </li>
          <li>
            <input type="checkbox"
                   id="soundcloud"
                   checked={this.state.searchSoundCloud}
                   onChange={this.toggleSoundCloud} />
            <label htmlFor="soundcloud">SoundCloud</label>
          </li>
          <li>
            <input type="checkbox"
                   id="youtube"
                   checked={this.state.searchYouTube}
                   onChange={this.toggleYouTube} />
            <label htmlFor="youtube">YouTube</label>
          </li>
        </ul>
      );
    }
  },

  renderError() {
    if ( this.state.error ) {
      return (
        <h4 className="error text-center nudge--top light">
          {this.state.error}
        </h4>
      );
    }
  },

  renderChildren() {
    return this.props.children && React.cloneElement(this.props.children, {
      params: this.props.params,
      query: this.props.query,
      currentUser: this.props.currentUser,
      currentTrack: this.props.currentTrack,
      userCollaborations: this.props.userCollaborations,
      userLikes: this.props.userLikes,
      setSearchState: this.setSearchState,
      showContextMenu: this.props.showContextMenu
    });
  },

  render() {
    return (
      <DocumentTitle title={Helpers.buildPageTitle('Search')}>
      <section className="content search">

        <PageControlBar type="search">
          <div className="search-container">
            <SearchBar ref="SearchBar"
                       valueLink={this.linkState('query')}
                       onKeyPress={this.handleKeyPress}
                       placeholder="Search..." />
          </div>
          <div className="loading-container">
            {this.renderSpinner()}
          </div>
          <div className="options-container">
            {this.renderTrackSearchOptions()}
          </div>
        </PageControlBar>

        <TabBar className="nudge-half--bottom">
          <ListLink to={`/search/tracks`} query={{ q: this.props.location.query.q }}>
            Tracks
          </ListLink>
          <ListLink to={`/search/playlists`} query={{ q: this.props.location.query.q }}>
            Playlists
          </ListLink>
          <ListLink to={`/search/groups`} query={{ q: this.props.location.query.q }}>
            Groups
          </ListLink>
        </TabBar>

        {this.renderError()}

        {this.renderChildren()}

      </section>
      </DocumentTitle>
    );
  }

});

export default SearchPage;