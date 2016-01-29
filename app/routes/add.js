import Ember from 'ember';


var AddRoute = Ember.Route.extend({
	

    setupController: function(controller, model) {
        controller.set('content', null)
		          .set('newcity','')
		          .set('citySelect',false);
				  


	}
});

export default AddRoute;