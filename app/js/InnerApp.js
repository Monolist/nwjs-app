'use strict';

import React                      from 'react';

import Header                     from './components/Header';
import CurrentlyPlaying           from './components/CurrentlyPlaying';
import PlayerControlsMixin        from './mixins/PlayerControlsMixin';
import ContextMenuMixin           from './mixins/ContextMenuMixin';
import LayeredComponentMixin      from './mixins/LayeredComponentMixin';
import GlobalActionIndicatorStore from './stores/GlobalActionIndicatorStore';
import ModalStore                 from './stores/ModalStore';
import NavigationSidebar          from './components/NavigationSidebar';
import GlobalActionIndicator      from './components/GlobalActionIndicator';
import Modal                      from './components/Modal';
import Footer                     from './components/Footer';

const InnerApp = React.createClass({

  // ListenerMixin is also required, but already included by PlayerControlsMixin
  mixins: [PlayerControlsMixin, ContextMenuMixin, LayeredComponentMixin],

  propTypes: {
    children: React.PropTypes.object,
    params: React.PropTypes.object,
    query: React.PropTypes.object,
    currentUser: React.PropTypes.object,
    userCollaborations: React.PropTypes.array,
    userLikes: React.PropTypes.array
  },

  getInitialState() {
    return {
      globalActionIndicator: null,
      modalClass: null,
      modalContents: null
    };
  },

  _handleActionIndicator(isSuccess) {
    this.setState({ globalActionIndicator: isSuccess ? 'success' : 'failure' }, () => {
      setTimeout(() => {
        this.setState({ globalActionIndicator: null });
      }, 2000);
    });
  },

  _handleModal(modalClass, modalContents) {
    this.setState({
      modalClass: modalClass,
      modalContents: modalContents
    });
  },

  componentDidMount() {
    this.listenTo(GlobalActionIndicatorStore, this._handleActionIndicator);
    this.listenTo(ModalStore, this._handleModal);
  },

  renderGlobalActionIndicator() {
    if ( this.state.globalActionIndicator ) {
      return (
        <GlobalActionIndicator isSuccess={this.state.globalActionIndicator === 'success'} />
      );
    }
  },

  renderLayer() {
    let element = (<span />);

    if ( this.state.modalContents ) {
      element = (
        <Modal className={this.state.modalClass}>
          {this.state.modalContents}
        </Modal>
      );
    }

    return element;
  },

  renderChildren() {
    return this.props.children && React.cloneElement(this.props.children, {
      params: this.props.params,
      query: this.props.query,
      currentUser: this.props.currentUser,
      currentTrack: this.state.track,
      userCollaborations: this.props.userCollaborations,
      userLikes: this.props.userLikes,
      showContextMenu: this.showContextMenu,
      sortPlaylist: this.sortPlaylist
    });
  },

  render() {
    return (
      <div className="full-height">

        <Header currentUser={this.props.currentUser} showContextMenu={this.showContextMenu} />

        <CurrentlyPlaying ref="currentlyPlaying"
                          player={this.player}
                          audio={this.audio}
                          currentTrack={this.state.track}
                          paused={this.state.paused}
                          time={this.state.time}
                          duration={this.state.duration}
                          volume={this.state.volume}
                          repeat={this.state.repeat}
                          shuffle={this.state.shuffle}
                          nextTrack={this.nextTrack}
                          previousTrack={this.previousTrack}
                          togglePlay={this.togglePlay}
                          seekTrack={this.seekTrack}
                          updateVolume={this.updateVolume}
                          toggleRepeat={this.toggleRepeat}
                          toggleShuffle={this.toggleShuffle} />

        <div className="main-content-wrapper">
          <NavigationSidebar currentUser={this.props.currentUser} />
          {this.renderChildren()}
          <div className="shadow" />
        </div>

        <Footer currentUser={this.props.currentUser} />

        {this.renderContextMenu()}

        {this.renderGlobalActionIndicator()}

      </div>
    );
  }

});

export default InnerApp;