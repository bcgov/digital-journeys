'use strict';

module.exports = function(formio) {
  // Include the hook system.
  const hook = require('../util/hook')(formio);

  /**
   * The Schema for ActionItems.
   *
   * @type {exports.Schema}
   */
  const SubmissionACLSchema = hook.alter('submissionAclSchema', new formio.mongoose.Schema({
    form: {
      type: formio.mongoose.Schema.Types.ObjectId,
      ref: 'form',
      index: true,
      required: true
    },
    submission: {
      type: formio.mongoose.Schema.Types.ObjectId,
      ref: 'submission',
      index: true,
      required: true
    },
    access: {
        type: [formio.schemas.AccessSchema],
        index: true
    },
  }));

  const model = require('./BaseModel')({
    schema: SubmissionACLSchema
  });

  try {
    model.schema.index({created: 1}, {expireAfterSeconds: 2592000});
  } catch (err) {
    console.log(err.message);
  }

  // Add indexes to speed up the action items pages.
  model.schema.index(hook.alter('schemaIndex', {state: 1, deleted: 1, modified: -1}));
  model.schema.index(hook.alter('schemaIndex', {handler: 1, deleted: 1, modified: -1}));
  model.schema.index(hook.alter('schemaIndex', {handler: 1, method: 1, deleted: 1, modified: -1}));

  return model;
};
