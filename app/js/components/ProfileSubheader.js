'use strict';

import React        from 'react';
import _            from 'lodash';
import cx           from 'classnames';

import UserActions  from '../actions/UserActions';
import ActionButton from './ActionButton';

const ProfileSubheader = React.createClass({

  propTypes: {
    currentUser: React.PropTypes.object,
    profile: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      profile: {}
    };
  },

  currentUserDoesFollow() {
    return _.some(this.props.profile.followers, { followerId: this.props.currentUser.id });
  },

  toggleFollowUser() {
    UserActions.follow(this.props.profile, this.props.currentUser);
  },

  renderProfileImage() {
    if ( this.props.profile.imageUrl ) {
      const imageStyles = {
        backgroundImage: `url(${this.props.profile.imageUrl})`
      };

      return (
        <div className="entity-subheader-image-container">
          <div className="entity-subheader-image" style={imageStyles} />
        </div>
      );
    }
  },

  renderProfileInfo() {
    if ( !_.isEmpty(this.props.profile) ) {
      return (
        <div>
          <h1 className="entity-subheader-title">
            {this.props.profile.username}
          </h1>
          <ul className="entity-subheader-stats">
            <li className="entity-subheader-stat-item">
              <span className="nudge-quarter--right">
                <i className="icon-list entity-subheader-stat-icon" />
                {this.props.profile.playlists ? this.props.profile.playlists.length : 0}
              </span>
              <span className="nudge-quarter--right">
                <i className="icon-handshake entity-subheader-stat-icon" />
                {this.props.profile.collaborations ? this.props.profile.collaborations.length : 0}
              </span>
              <span className="nudge-quarter--right">
                <i className="icon-group entity-subheader-stat-icon" />
                {this.props.profile.groups ? this.props.profile.groups.length : 0}
              </span>
              <span className="nudge-quarter--right">
                <i className="icon-heart entity-subheader-stat-icon" />
                {this.props.profile.likes ? this.props.profile.likes.length : 0}
              </span>
              <span>
                <i className="icon-star entity-subheader-stat-icon" />
                {this.props.profile.starredTracks ? this.props.profile.starredTracks.length : 0}
              </span>
            </li>
          </ul>
        </div>
      );
    }
  },

  renderFollowButton() {
    const hasUserAndProfile = !_.isEmpty(this.props.currentUser) && !_.isEmpty(this.props.profile);
    const usersAreDifferent = this.props.currentUser.id !== this.props.profile.id;
    const currentUserDoesFollow = this.currentUserDoesFollow();

    if ( hasUserAndProfile && usersAreDifferent ) {
      const classes = cx({
        'active-yellow': currentUserDoesFollow
      });
      const tooltip = currentUserDoesFollow ? 'Unfollow' : 'Follow';

      return (
        <ActionButton ref="followButton"
                      onClick={this.toggleFollowUser}
                      icon="rss-square"
                      className={classes}
                      tooltip={tooltip} />
      );
    }
  },

  render() {
    return (
      <div className="entity-subheader profile-subheader">
        <div className="max-width-wrapper d-f ai-c">
          {this.renderProfileImage()}

          <div className="entity-subheader-info-container">
            {this.renderProfileInfo()}
          </div>

          <div className="entity-subheader-actions-container text-right">
            <div className="entity-subheader-button-group">
              {this.renderFollowButton()}
            </div>
          </div>
        </div>
      </div>
    );
  }

});

export default ProfileSubheader;
