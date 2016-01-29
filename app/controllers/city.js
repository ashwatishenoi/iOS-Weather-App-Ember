import Ember from 'ember';


var CityDetails = Ember.ArrayController.extend({
	
	
	useUSUnits:true,
	cityName:'',
	summary:'',
	temperature:'',
	cityname:'',
	todaySummary:'',
	sunrise:'',
	sunset:'',
	rain:'',
	humidity:'',
	wind:'',
	apparentTemp:'',
	precipitation:'',
	pressure:'',
	visibility:'',
	hourlyData:[],
	dailyData:[],
	day:'',
	relativeDay:'',
	temperatureMax:'',
	temperatureMin:'',
	isClass:'',
	cityId:'',
	isCurlocDenied:false,
	prevCityId:'',
	nextCityId:'',
	isFirstCity:'',
	isLastCity:'',
	isCurrent:'false',


	

	

});

export default CityDetails;