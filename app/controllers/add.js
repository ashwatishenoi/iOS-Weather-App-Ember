import Ember from 'ember';

var AddCity = Ember.ArrayController.extend({
	
	newcity:'',
	citySelect:false,
	isCity:false,
	
	/*observes the new city input text field*/
    cityDidChange: function() 
	{    	  
		if((this.get('newcity').length)>=3)
		{
			var self=this;
			var name=self.get('newcity');
			return Ember.$.ajax({
			url: 'http://coen268.peterbergstrom.com/locationautocomplete.php?query='+name,
			method: 'GET',
			dataType: 'jsonp',
			}).then(function(result) 
			{
			var city       = [];
			var resultCities = result;

			if (resultCities) 
			{
				for(var i=0; i<resultCities.length; i++) 
				{
					city[i]=resultCities[i];

				}
			self.set('content',city);

			}

			return city;
			});

		}
    }.observes('newcity'),

	actions: 
	{
	    addCity: function(city) 
		{
			var self=this;
			var cityList=self.store.createRecord('autocompletemodel',{
				formatted_address:city.formatted_address,
				displayName:city.displayName,
				lat:city.lat,
				long:city.lng,
				city_id:city.id
				
			});
			cityList.save();
			self.set('citySelect',true);
			self.transitionToRoute('/');			
				
		}
	},		
});

export default AddCity;