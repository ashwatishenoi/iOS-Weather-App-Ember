import Ember from 'ember';
import WeatherModel from  'test-app/models/weathermodel';

var CityList = Ember.ArrayController.extend({
	needs:['add'],
	isEditing:false,
	useUSUnits:true,
	curLat:null,
	curLong:null,
	isCurlocDenied:false,
	isCurRecord:false,
	currTemperature:'',
	currTime:'',
	city:[{
		id:'',
		weatherData:null,
		
	}],
	recLen:null,
	isClass:'',
	refreshTimerSet:'',
	
	
	actions:
	{

		edit:function()
		{
			this.set('isEditing',true);
		},
		done:function()
		{
			this.set('isEditing',false);	
		},
		deleteCity:function(city)
		{

			this.store.find('autocompletemodel',city.id).then(function(autocompletemodel){
				autocompletemodel.destroyRecord();
			});
		},
		
		useCelsius:function()
		{
			this.set('useUSUnits',false);	
			this.controllerFor('city').set('useUSUnits',false);
			if(this.get('isCurlocDenied')===true)
			{
				this.fetchCityList();
			}
			else
			{
				this.fetchWeather();
			}
		},
		
		useFaren:function()
		{
			this.set('useUSUnits',true);	
			this.controllerFor('city').set('useUSUnits',true);
			if(this.get('isCurlocDenied')===true)
			{
				this.fetchCityList();
			}
			else
			{
			this.fetchWeather();
			}
		}
		
	},
	
	getCurrentLocation: function ()
	{
		
	    if (navigator.geolocation)
	  	    {
				var self=this;			
				navigator.geolocation.getCurrentPosition(
				function(position)
				{
					self.set('curLat',position.coords.latitude);
					self.set('curLong',position.coords.longitude);
					self.set('isCurlocDenied',false);			
					self.fetchWeather();
				},
				function()
				{
					self.set('isCurlocDenied',true);
					self.fetchCityList();
				}
			 );				 
	  	    }							
	},
	
	fetchWeather:function()
	{
			
		var lat;
		var long;
		var self=this;
		//Fetch current location Weather
		if(self.get('isCurlocDenied')!==true)
		{
			lat=self.get('curLat');
			long=self.get('curLong');
		    return Ember.$.ajax({
		 	method: 'GET',
		 	dataType: 'jsonp',
		 	url: 'https://api.forecast.io/forecast/db30270bda0454fd01e219923ae980c8/'+lat+','+long,
		     }).then(function(result) {
				 
				 var units=self.get('useUSUnits');
				 
				 var city=WeatherModel.create({
					 id:'1',
					 current:result.currently,
					 offset:result.offset,
					 units:units
				 });
				 
				 
				 self.set('city.id[0]','1');
				 self.set('city.weatherData[0]',result);				 
				 self.set('currTemperature',city.temperature());
				 self.set('currTime',city.time());
				 self.set('summary',city.summary());	
				 var backgrnd=self.conditionClassname(result);	
				 self.set('isClass',backgrnd); 
				 self.fetchCityList();

		     });
	    }
	
	},
	
	fetchCityList:function()
	{		
		var self=this;
		self.store.find('autocompletemodel')
		.then(function(autocompletemodel)
		{
					var x;
					var i;
					self.set('recLen',autocompletemodel.get('length'));		
					x=self.get('recLen');
					for(i=0; i<x; i++)
					{
						var lat;
						var long;
						var city_id;
						var city=autocompletemodel.objectAt(i);
						lat=city.get('lat');
						long=city.get('long');
						city_id=city.get('id');
						self.getWeatherfromApi(lat,long,city_id);
																
					}

						
		});
		
		/*Refresh data every 5 ms*/
		Ember.run.later(this,'refreshWeatherData',5000);
		
	},
	
	/*Fetch weather from API for the city list*/
	getWeatherfromApi:function(lat,long,cityid)
	{
		var self=this;
		return Ember.$.ajax({
		 	method: 'GET',
		 	dataType: 'jsonp',
		 	url: 'https://api.forecast.io/forecast/db30270bda0454fd01e219923ae980c8/'+lat+','+long,
		     }).then(function(result) {
				 
				 self.set('city.id['+cityid+']',cityid);
				 self.set('city.weatherData['+cityid+']',result);
				 self.setTempTime(cityid);			 
			 });				
	},

   /*Set the temperature and time for the city list*/	
	setTempTime:function (cityid)
	{
		var self=this;
		var resWeather=self.get('city.weatherData['+cityid+']');
		var units=self.get('useUSUnits');	
	    var city=WeatherModel.create({
		 id:cityid,
		 current:resWeather.currently,
		 offset:resWeather.offset,
			units:units
	 	});
		
		var temp=city.temperature();
		var time=city.time();
	    var backgrnd=self.conditionClassname(resWeather);	
		self.store.find('autocompletemodel',cityid).then(function(autocompletemodel){
			autocompletemodel.set('temperature',temp);
			autocompletemodel.set('time',time);
			autocompletemodel.set('backgrnd',backgrnd);
			if(self.get('refreshTimerSet')!==true)
			{
			autocompletemodel.set('isCurrent',false);
			}
			autocompletemodel.save();
		});						
	},
	
	/*update the background class name info*/
    conditionClassname: function(weather) 
	{
      var classNames = '';

      if(weather) {
        var conditionsNow = weather.hourly.data[0],
            date          = new Date(conditionsNow.time * 1000);
          
        // It is day if you're between sunrise and sunset. Then add the is-day class. Otherwise, add is-night
        if(conditionsNow.time >= weather.daily.data[0].sunriseTime && conditionsNow.time <= weather.daily.data[0].sunsetTime) {
          classNames += 'is-day ';
        } else {
          classNames += 'is-night ';
        }

        // If the icon name includes cloudy OR there is a cloudCover above 0.2, make it cloudy.
        // The 0.2 is completely arbitary.
        if(conditionsNow.icon.indexOf('cloudy') !== -1 || conditionsNow.cloudCover > 0.2) {
          classNames += 'is-cloudy ';
        }
      }
      return classNames;
    },
	
	/*function called to refresh weather at set interval*/
	refreshWeatherData:function()
	{
		var self=this;
		self.set('refreshTimerSet',true);
		if(self.get('isCurlocDenied')!==true)
		{
			self.fetchWeather();
		}
		else
		{
			self.fetchCityList();
		}
	},
	
	init: function()
	{
		this._super();
		Ember.run.once(this,'getCurrentLocation');
		
	}


});

export default CityList; 