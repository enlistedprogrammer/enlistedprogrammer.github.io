import Ember from 'ember';

const {Controller, computed, inject, isArray} = Ember;
const {alias} = computed;

export default Controller.extend({
    notifications: inject.service(),

    args: alias('model'),

    confirm: {
        accept: {
            text: '离开此页',
            buttonClass: 'btn btn-red'
        },
        reject: {
            text: '留在此页',
            buttonClass: 'btn btn-default btn-minor'
        }
    },

    actions: {
        confirmAccept() {
            let args = this.get('args');
            let editorController,
                model,
                transition;

            if (isArray(args)) {
                editorController = args[0];
                transition = args[1];
                model = editorController.get('model');
            }

            if (!transition || !editorController) {
                this.get('notifications').showNotification('抱歉，系统故障。请将此问题提交至 Ghost 开发团队。', {type: 'error'});
                return true;
            }

            // definitely want to clear the data store and post of any unsaved, client-generated tags
            model.updateTags();

            if (model.get('isNew')) {
                // the user doesn't want to save the new, unsaved post, so delete it.
                model.deleteRecord();
            } else {
                // roll back changes on model props
                model.rollbackAttributes();
            }

            // setting hasDirtyAttributes to false here allows willTransition on the editor route to succeed
            editorController.set('hasDirtyAttributes', false);

            // since the transition is now certain to complete, we can unset window.onbeforeunload here
            window.onbeforeunload = null;

            transition.retry();
        },

        confirmReject() {
        }
    }
});
