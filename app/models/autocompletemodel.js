import DS from'ember-data';

var AutoCompleteModel = DS.Model.extend({
	formatted_address:DS.attr('string'),
	displayName:DS.attr('string'),
	lat:DS.attr('string'),
	long:DS.attr('string'),
	city_id:DS.attr('string'),	
	temperature:DS.attr('string'),
	time:DS.attr('string'),
	backgrnd:DS.attr('string'),
	isCurrent:DS.attr('boolean',{defaultValue:false})


});

export default AutoCompleteModel;