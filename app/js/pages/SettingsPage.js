'use strict';

import React               from 'react';
import _                   from 'lodash';
import cx                  from 'classnames';
import DocumentTitle       from 'react-document-title';

import LabelHighlightMixin from '../mixins/LabelHighlightMixin';
import Helpers             from '../utils/Helpers';
import AwsAPI              from '../utils/AwsAPI';
import UserActions         from '../actions/UserActions';
import LoggedInRouteMixin  from '../mixins/LoggedInRouteMixin';
import FileInput           from '../components/FileInput';
import Spinner             from '../components/Spinner';
import Avatar              from '../components/Avatar';

const SettingsPage = React.createClass({

  mixins: [LoggedInRouteMixin, LabelHighlightMixin],

  propTypes: {
    currentUser: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      currentUser: {}
    };
  },

  getInitialState() {
    return {
      email: this.props.currentUser.email,
      newImage: null,
      newPassword: '',
      confirmNewPassword: '',
      focusedInput: null,
      loading: false,
      error: null
    };
  },

  componentWillReceiveProps(nextProps) {
    if ( !_.isEmpty(nextProps.currentUser) ) {
      this.setState({
        email: nextProps.currentUser.email
      });
    }
  },

  isFormInvalid() {
    const hasNewEmail = this.state.email && this.state.email.length && this.state.email !== this.props.currentUser.email;
    const hasNewImage = !!this.state.newImage;
    const hasNewPassword = this.state.newPassword && this.state.newPassword.length;

    return !hasNewEmail && !hasNewImage && !hasNewPassword;
  },

  updateImage(file) {
    this.setState({ newImage: file });
  },

  uploadImage() {
    return new Promise((resolve) => {
      if ( this.state.newImage && !_.isEmpty(this.props.currentUser) ) {
        AwsAPI.uploadUserImage(this.state.newImage, this.props.currentUser.id).then(() => {
          resolve();
        }).catch(() => {
          // Still resolve since user needs to be updated
          resolve();
        });
      } else {
        resolve();
      }
    });
  },

  updateUser() {
    const hasNewEmail = this.state.email && this.state.email.length && this.state.email !== this.props.currentUser.email;
    const hasNewPassword = this.state.newPassword && this.state.newPassword.length;
    const newPasswordsMatch = this.state.newPassword === this.state.confirmNewPassword;
    const updates = {};

    if ( hasNewEmail ) {
      updates.email = this.state.email;
    }

    if ( hasNewPassword && newPasswordsMatch ) {
      updates.password = this.state.newPassword;
    }

    return new Promise((resolve, reject) => {
      UserActions.update(updates, err => {
        if ( err ) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  handleEmailChange(evt) {
    this.setState({
      email: evt.target.value
    });
  },

  handleNewPasswordChange(evt) {
    this.setState({
      newPassword: evt.target.value
    });
  },

  handleConfirmNewPasswordChange(evt) {
    this.setState({
      confirmNewPassword: evt.target.value
    });
  },

  handleSubmit(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    if ( this.state.newPassword !== this.state.confirmNewPassword ) {
      this.setState({ error: 'Those passwords don\'t match!' });
    } else {
      this.setState({ error: null, loading: true });

      this.uploadImage().then(this.updateUser).then(() => {
        this.setState({
          loading: false,
          error: null,
          newPassword: '',
          confirmNewPassword: '',
          image: null
        });
      }).catch(err => {
        this.setState({ loading: false, error: err });
      });
    }
  },

  renderUserImage() {
    if ( this.props.currentUser.imageUrl ) {
      return (
        <div>
          <div />
          <div className="text-center nudge-half--bottom">
            <Avatar user={this.props.currentUser} size={'200px'} className="block-center" includeLink={false} />
          </div>
        </div>
      );
    }
  },

  renderError() {
    if ( this.state.error ) {
      return (
        <div className="error-container nudge-half--bottom text-center">
          {this.state.error}
        </div>
      );
    }
  },

  render() {
    const emailLabelClasses = cx({ 'active': this.state.focusedInput === 'email' });
    const imageLabelClasses = cx({ 'active': this.state.focusedInput === 'image-url' });
    const passwordLabelClasses = cx({ 'active': this.state.focusedInput === 'password' });
    const confirmLabelClasses = cx({ 'active': this.state.focusedInput === 'confirm-password' });
    const buttonChild = this.state.loading ? <Spinner size={10} /> : <span>Save Changes</span>;

    return (
      <DocumentTitle title={Helpers.buildPageTitle('Settings')}>
      <section className="content settings fx-4 max-width-wrapper">

        <form id="settings-form" className="full-page narrow" onSubmit={this.handleSubmit}>

          {this.renderUserImage()}

          <div className="table-container">
            <div className="input-container">
              <label htmlFor="username">Username</label>
              <div className="input">
                <input type="text"
                       id="username"
                       value={this.props.currentUser.username}
                       placeholder="Username"
                       disabled />
              </div>
            </div>

            <div className="input-container">
              <label htmlFor="email" className={emailLabelClasses}>Email</label>
              <div className="input">
                <input type="text"
                       id="email"
                       value={this.state.email}
                       onChange={this.handleEmailChange}
                       placeholder="Email address" />
              </div>
            </div>

            <div className="input-container">
              <label htmlFor="image-url" className={imageLabelClasses}>New Image</label>
              <div className="input">
                <FileInput id="image-url"
                           accept="image/x-png, image/gif, image/jpeg"
                           processFile={this.updateImage} />
              </div>
            </div>

            <div className="input-container">
              <label htmlFor="password" className={passwordLabelClasses}>New Password</label>
              <div className="input">
                <input type="password"
                       id="password"
                       value={this.state.newPassword}
                       onChange={this.handleNewPasswordChange}
                       placeholder="New password" />
              </div>
            </div>

            <div className="input-container">
              <label htmlFor="confirm-password" className={confirmLabelClasses}>Confirm</label>
              <div className="input">
                <input type="password"
                       id="confirm-password"
                       value={this.state.confirmNewPassword}
                       onChange={this.handleConfirmNewPasswordChange}
                       placeholder="Confirm new password" />
              </div>
            </div>
          </div>

          {this.renderError()}

          <div className="submit-container">
            <button type="submit"
                   className="btn full"
                   disabled={this.state.loading || this.isFormInvalid()}>
              {buttonChild}
            </button>
          </div>

        </form>

      </section>
      </DocumentTitle>
    );
  }

});

export default SettingsPage;
