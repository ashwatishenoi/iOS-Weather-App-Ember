import Ember from 'ember';

var IndexRoute = Ember.Route.extend({

	model:function(){
	var self=this;	
	if(self.controllerFor("add").get('citySelect')===true)
	{
		self.controllerFor("index").fetchCityList();
	}

	return self.store.find('autocompletemodel');
	},
		
	
    setupController: function(controller, model) {

        controller.set('content', null)
		          .set('content',model)
				  .set('isEditing', false);



	},
		

});


export default IndexRoute;