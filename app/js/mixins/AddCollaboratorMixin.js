'use strict';

import React                 from 'react/addons';
import _                     from 'lodash';
import $                     from 'jquery';
import cx                    from 'classnames';

import UserSearchStore       from '../stores/UserSearchStore';
import PlaylistActions       from '../actions/PlaylistActions';
import UserActions           from '../actions/UserActions';
import LayeredComponentMixin from './LayeredComponentMixin';
import Modal                 from '../components/Modal';
import Spinner               from '../components/Spinner';
import Avatar                from '../components/Avatar';

var AddCollaboratorMixin = {

  // NOTE: LinkedStateMixin and ListenerMixin required, but already being loaded by PlaylistPage.js where this mixin is used
  mixins: [LayeredComponentMixin],

  getInitialState() {
    return {
      showCollaboratorModal: false,
      userSearchQuery: '',
      users: [],
      loading: false,
      focusedInput: null
    };
  },

  componentDidMount() {
    this.timer = null;
    this.listenTo(UserSearchStore, this.doneSearching);
  },

  componentWillReceiveProps(nextProps) {
    if ( !_.isEqual(this.props, nextProps) ) {
      $('.add-icon.inactive').hover(function() {
        $(this).removeClass('fa-check');
        $(this).addClass('fa-remove');
      });

      $('.add-icon.inactive').mouseleave(function() {
        $(this).removeClass('fa-remove');
        $(this).addClass('fa-check');
      });
    }
  },

  doneSearching(err, users) {
    if ( err ) {
      this.setState({ error: err.message, loading: false });
    } else {
      this.setState({ users: users, error: null, loading: false });
    }
  },

  createFocusListeners() {
    var component = this;

    $('input#user-query').focus(function() {
      component.setState({ focusedInput: $(this).attr('id') });
    });

    $('input#user-query').blur(function() {
      component.setState({ focusedInput: null });
    });
  },

  toggleCollaboratorModal() {
    this.setState({ showCollaboratorModal: !this.state.showCollaboratorModal }, () => {
      if ( this.state.showCollaboratorModal ) {
        this.createFocusListeners();
      }
    });
  },

  doSearch() {
    if ( this.state.userSearchQuery.length ) {
      this.setState({ loading: true });
      UserActions.search(this.state.userSearchQuery);
    }
  },

  addCollaborator(user) {
    let playlistCopy = this.state.playlist;

    playlistCopy.collaborations.push({
      userId: user.id
    });

    this.setState({ playlist: playlistCopy }, PlaylistActions.addCollaborator(this.state.playlist, user));
  },

  removeCollaborator(user) {
    let playlistCopy = this.state.playlist;

    playlistCopy.collaborations = _.reject(this.state.playlist.collaborations, collaboration => {
      return collaboration.userId === user.id;
    });

    this.setState({ playlist: playlistCopy }, PlaylistActions.removeCollaborator(this.state.playlist, user));
  },

  handleKeyUp() {
    clearTimeout(this.timer);
    this.timer = setTimeout(this.doSearch, 1000);
  },

  handleKeyPress(evt) {
    let keyCode = evt.keyCode || evt.which;

    if ( keyCode === '13' || keyCode === 13 ) {
      clearTimeout(this.timer);
      this.doSearch();
    }
  },

  renderSpinner() {
    if ( this.state.loading ) {
      return (
        <Spinner size={10} />
      );
    }
  },

  renderError() {
    if ( this.state.error ) {
      return (
        <div className="error-container nudge-half--ends">
          {this.state.error}
        </div>
      );
    }
  },

  renderUserResults() {
    let element = null;
    let users;
    let userIsCollaborator;
    let addIconClasses;
    let addIconFunction;

    if ( this.state.users && this.state.users.length ) {
      users = _.map(this.state.users, function(user, index) {
        userIsCollaborator = !!_.where(this.state.playlist.collaborations, { userId: user.id }).length;
        addIconFunction = userIsCollaborator ? this.removeCollaborator.bind(null, user) : this.addCollaborator.bind(null, user);
        addIconClasses = cx({
          'add-icon': true,
          'fa': true,
          'fa-plus': !userIsCollaborator,
          'fa-check': userIsCollaborator,
          'inactive': userIsCollaborator
        });

        return (
          <li className="user" key={index}>
            <div className="avatar-container">
              <Avatar user={user} includeLink={false} size="40px" />
            </div>
            <div className="name-container">
              <h5>{user.username}</h5>
            </div>
            <div className="add-icon-container">
              <i className={addIconClasses} onClick={addIconFunction}  />
            </div>
          </li>
        );
      }.bind(this));

      element = (
        <ul className="users-container nudge-half--top">
          {users}
        </ul>
      );
    }

    return element;
  },

  renderLayer() {
    let element = (<span />);
    let labelClasses = cx({ 'active': this.state.focusedInput === 'user-query' });

    if ( this.state.showCollaboratorModal ) {
      element = (
        <Modal className="add-collaborators" onRequestClose={this.toggleCollaboratorModal}>

          <div className="input-label-container">
            <div>
              <label htmlFor="user-query" className={labelClasses}>Search Users</label>
            </div>
            <div className="input-container nudge-half--bottom">
              <input type="text"
                     id="user-query"
                     valueLink={this.linkState('userSearchQuery')}
                     onKeyUp={this.handleKeyUp}
                     onKeyPress={this.handleKeyPress}
                     placeholder="Search for users..." />
              {this.renderSpinner()}
            </div>
          </div>

          {this.renderError()}

          {this.renderUserResults()}

        </Modal>
      );
    }

    return element;
  },

};

export default AddCollaboratorMixin;