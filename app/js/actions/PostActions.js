'use strict';

import Reflux from 'reflux';

const PostActions = Reflux.createActions([

  'create',
  'open',
  'like',
  'addComment',
  'removeComment',
  'delete',
  'likeViewing',
  'addCommentViewing',
  'removeCommentViewing',
  'deleteViewing'

]);

export default PostActions;
