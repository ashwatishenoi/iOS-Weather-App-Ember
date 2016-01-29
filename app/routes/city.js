import Ember from 'ember';
import WeatherModel from 'test-app/models/weathermodel';

var CityRoute = Ember.Route.extend({



	
	actions:{
		useCelsius:function()
		{
			this.controllerFor("city").set('useUSUnits',false);	
			this.controllerFor('index').set('useUSUnits',false);
			var id=this.controllerFor("city").get('cityId');
			this.fetchCityWeather(id);
			
		},
		
		useFaren:function()
		{
			this.controllerFor("city").set('useUSUnits',true);	
			this.controllerFor('index').set('useUSUnits',true);
			var id=this.controllerFor("city").get('cityId');
			this.fetchCityWeather(id);
		},
		
		navToPrevCity:function()
		{
			var self=this;
			if(self.controllerFor("city").get('isFirstCity')!==true)
			{
				var prevId=self.controllerFor("city").get('prevCityId');
				self.transitionTo('city',prevId);
			}															

	    },
		
		navToNextCity:function()
		{
			var self=this;
			if(self.controllerFor("city").get('isLastCity')!==true)
			{
				var nextId=self.controllerFor("city").get('nextCityId');
				self.transitionTo('city',nextId);
			}															

	    },
	},
	
	updateCityPositionInfo:function(cityid){

		
		var self=this;
		self.store.find('autocompletemodel').then(function(autocompletemodel)
		{
					var len;
					var i;	
					var cityFound;
					var prevId;
					var nextId;
					var prevCity;
					var nextCity;
					len=autocompletemodel.get('length');
					/*Reset flags*/
					self.controllerFor("city").set('isLastCity',false);
					self.controllerFor("city").set('isFirstCity',false);
					var curLocDenied=self.controllerFor("city").get('isCurlocDenied');
					if(cityid === '0')
					{
						self.controllerFor("city").set('isFirstCity',true);
						nextCity=autocompletemodel.objectAt(0);
						nextId=nextCity.get('id');
						self.controllerFor("city").set('nextCityId',nextId);
						self.controllerFor("city").set('isCurrent',true);
						autocompletemodel.objectAt(0).set('isCurrent',false);
						autocompletemodel.objectAt(0).save();
						
					}
					else
					{
					self.controllerFor("city").set('isCurrent',false);
					for(i=0; i<len; i++)
					{

						var city=autocompletemodel.objectAt(i);
						var city_id=city.get('id');
						if(city_id===cityid)
						{
							cityFound=true;
							autocompletemodel.objectAt(i).set('isCurrent',true);
							autocompletemodel.objectAt(i).save();
							if(curLocDenied===true)
							{
								if(i>0 && i!==(len-1))
								{
									prevId=i-1;
									nextId=i+1;
									prevCity=autocompletemodel.objectAt(prevId);
									prevId=prevCity.get('id');
									nextCity=autocompletemodel.objectAt(nextId);
									nextId=nextCity.get('id');
									self.controllerFor("city").set('prevCityId',prevId);
									self.controllerFor("city").set('nextCityId',nextId);							
							
								}
								else if(i===(len-1))
								{
									prevId=i-1;
									prevCity=autocompletemodel.objectAt(prevId);
									prevId=prevCity.get('id');
									self.controllerFor("city").set('prevCityId',prevId);
									self.controllerFor("city").set('isLastCity',true);
								}
								else{

									nextId=i+1;
									nextCity=autocompletemodel.objectAt(nextId);
									nextId=nextCity.get('id');
									self.controllerFor("city").set('isFirstCity',true);
									self.controllerFor("city").set('nextCityId',nextId);
									}
							}
						else
						{
							if(i===0)
							{
								prevId=0;
								nextId=i+1;
								nextCity=autocompletemodel.objectAt(nextId);
								nextId=nextCity.get('id');
								self.controllerFor("city").set('prevCityId',prevId);
								self.controllerFor("city").set('nextCityId',nextId);
							}

							else if(i===(len-1))
							{
								prevId=i-1;
								prevCity=autocompletemodel.objectAt(prevId);
								prevId=prevCity.get('id');
								self.controllerFor("city").set('prevCityId',prevId);
								self.controllerFor("city").set('isLastCity',true);
							}
							else
							{
									prevId=i-1;
									nextId=i+1;
									prevCity=autocompletemodel.objectAt(prevId);
									prevId=prevCity.get('id');
									nextCity=autocompletemodel.objectAt(nextId);
									nextId=nextCity.get('id');
									self.controllerFor("city").set('prevCityId',prevId);
									self.controllerFor("city").set('nextCityId',nextId);															
								
							 }
						}
				
						}
						else{
							autocompletemodel.objectAt(i).set('isCurrent',false);
							autocompletemodel.objectAt(i).save();
						}
					}
				    }
		
	    });
		
	},
	
	model:function(params){

		var self=this;	
		
		/*Check if current location is denied*/
	    if (navigator.geolocation)
	  	    {			
	  	     navigator.geolocation.getCurrentPosition(
				function()
				{
					self.controllerFor("city").set('isCurlocDenied',false);			
	  	        },
				 function()
				 {
					 self.controllerFor("city").set('isCurlocDenied',true);
			     }
			 );	
		}	
		var cityid=params.city_id;
		self.updateCityPositionInfo(cityid);
		self.controllerFor("city").set('cityId',cityid);
		self.fetchCityWeather();
		self.refreshCityWeather();
			//	Ember.run.later(this,fetchCityWeather,60000);
	   return self.store.find('autocompletemodel');	
	
	},
	
    setupController: function(controller, model) {

        controller.set('content', null)
		.set('content',model);

	},
	
	fetchCityWeather:function(){
		var self=this;
		var cityid=self.controllerFor("city").get('cityId');
		if(cityid==='0'){
			self.controllerFor("city").set('cityName','Current Location');
			var lat=self.controllerFor("index").get('curLat');
			var long=self.controllerFor("index").get('curLong');
			return Ember.$.ajax({
			 	method: 'GET',
			 	dataType: 'jsonp',
			 	url: 'https://api.forecast.io/forecast/db30270bda0454fd01e219923ae980c8/'+lat+','+long,
			     }).then(function(result) {

					 self.updateWeatherDetails(result);
				 
				 });
		}
		else
		{
	    self.store.find('autocompletemodel',cityid).then(function(autocompletemodel){

	    	self.controllerFor("city").set('cityName',autocompletemodel.get('displayName'));
			var lat=autocompletemodel.get('lat');
			var long=autocompletemodel.get('long');
			
			return Ember.$.ajax({
			 	method: 'GET',
			 	dataType: 'jsonp',
			 	url: 'https://api.forecast.io/forecast/db30270bda0454fd01e219923ae980c8/'+lat+','+long,
			     }).then(function(result) {

					 self.updateWeatherDetails(result);
				 
				 });
	    });
		}
		
	},

	updateWeatherDetails:function(weather){
		var self=this;
		var daily=weather.daily;
		var today=daily.data[0];
		var backgrnd;
		var unit=self.controllerFor("city").get('useUSUnits');
		var city=WeatherModel.create({
		 id:'1',
		 current:weather.currently,
		 offset:weather.offset,
		daily:weather.daily,
		today:today,
			units:unit
		});

		self.controllerFor("city").set('summary',city.summary());
		self.controllerFor("city").set('temperature',city.temperature());
		self.controllerFor("city").set('todaySummary',city.getTodaySummary());
		self.controllerFor("city").set('sunrise',city.getSunrise());
		self.controllerFor("city").set('sunset',city.getSunset());
		self.controllerFor("city").set('rain',city.getRainProbability());
		self.controllerFor("city").set('humidity',city.getHumidity());
		self.controllerFor("city").set('wind',city.getWindSpeed());
		self.controllerFor("city").set('apparentTemp',city.getFeelsLike());
		self.controllerFor("city").set('precipitation',city.getPrecipitation());
		self.controllerFor("city").set('pressure',city.getPressure());
		self.controllerFor("city").set('visibility',city.getVisibility());		
		self.updateHourlyDetails(weather);
		self.updateWeeklyForecast(weather);
		self.updateTodayOverview(weather);
		backgrnd=self.conditionClassname(weather);
		self.controllerFor("city").set('isClass',backgrnd);
	},

	updateHourlyDetails:function(weather){
		var self=this;
		var hourly=weather.hourly;
		var hour=[];
		var unit=self.controllerFor("city").get('useUSUnits');
		for(var i=0;i<24;i++)
		{
			var hourData=hourly.data[i];
			var time=hourData.time;
			var city=WeatherModel.create({
			 offset:weather.offset,	
			units:unit,		 
			});
			var hrAmPm=city.getHourly(time,i);
			var hrTemp=city.formatTemperature(parseInt(hourData.temperature));
			var hourDetail=WeatherModel.create({
			 hour:hrAmPm,	
			 hrIcon:'/assets/images/'+hourData.icon+'.png',
			 hrTemp:hrTemp,
			});
			
			hour.pushObject(hourDetail);
									
			
		}
		self.controllerFor("city").set('hourlyData',hour);
	},
	
	updateWeeklyForecast: function(weather)
	{
		var self=this;
		var daysOfWeek=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
		var count;
		var day;
		var today;
		var daily;
		var dailyData=[];
		var unit=self.controllerFor("city").get('useUSUnits');
		daily=weather.daily;
		today=daily.data[0];
		var city=WeatherModel.create({
		current:weather.currently,	
		offset:weather.offset,
		units:unit			 
		});
		
		 day=city.getDayofWeek();		 

		for (count=0;count<8;count++)
		{
			today=daily.data[count];
			var tempMax=city.formatTemperature(parseInt(today.temperatureMax));
			var tempMin=city.formatTemperature(parseInt(today.temperatureMin));

			 var dailyDetail=WeatherModel.create({
				 day:daysOfWeek[day],
				 tempMax:tempMax,
				 tempMin:tempMin,
				 dailyIcon:'/assets/images/'+today.icon+'.png',
			 });
			 
			 dailyData.pushObject(dailyDetail);			 
				if (day===6)
				{
					day =0;
				}
				else{
					day++;
				}
				
			}
			self.controllerFor("city").set('dailyData',dailyData);
		
	},
	
	updateTodayOverview:function(weather)
	{
		var self=this;
		var daysOfWeek=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
		var daily;
		var today;
		var unit=self.controllerFor("city").get('useUSUnits');
		daily=weather.daily;
		today=daily.data[0];
		var city=WeatherModel.create({
		current:weather.currently,	
		offset:weather.offset,
			units:unit			 
		});
	    var localDate  = city.getLocalDate(),
	    diff           = Math.round((localDate.getTime() - new Date().getTime())/(24*3600*1000)),
	    relativeDate   = 'Today';
	    if(diff < 0) {
	      relativeDate = 'Yesterday';
	    } else if(diff > 0) {
	      relativeDate = 'Tomorrow';
	    }
		var day=city.getDayofWeek();
		day=daysOfWeek[day];
		self.controllerFor("city").set('day',day);
		self.controllerFor("city").set('relativeDay',relativeDate);
		self.controllerFor("city").set('temperatureMax',city.formatTemperature(parseInt(today.temperatureMax)));
		self.controllerFor("city").set('temperatureMin',city.formatTemperature(parseInt(today.temperatureMin)));
		
	},
	
    conditionClassname: function(weather) {
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
	
	refreshCityWeather:function(){
		this.fetchCityWeather();
		/*Refresh every 10 min*/
		Ember.run.later(this,'refreshCityWeather',600000);
	},


	
});


export default CityRoute;