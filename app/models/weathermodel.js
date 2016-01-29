import Ember from 'ember';

var WeatherModel = Ember.Object.extend({
	
	id:null,
	hour:'',
	hrIcon:'',
	hrTemp:'',
	day:'',
	tempMax:'',
	tempMin:'',
	dailyIcon:'',
 
 	temperature:function()
	{
		return this.formatTemperature(parseInt(this.get('current.temperature')));
	},
	
    formatTemperature: function(temp) 
	{
      // If not using US units, then convert to Celsius.
      // See: http://fahrenheittocelsius.com
	  var unit=this.get('units');
      if(unit ===false)
	  {
	  	temp=parseInt((temp-30)/2);
	  }
	  return temp+'˚';
    }, 
	
	summary:function()
	{
		return this.get('current.summary');
	},
	
	time:function()
	{
		var time = this.get('current.time');
		var offset=this.get('offset');
		time=this.getLocalDate(time,offset);
		time=this.getTimeAmPm(time);
		
		return time;
	},
	
	getLocalDate:function (time, offset) 
	{
	  var date = new Date(time * 1000);
	  var utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes());
	  utc.setHours(utc.getHours() + offset);
	  return utc;
	},
	
	 getTimeAmPm:function(time)
	{
		var hour,
		    minutes,
		    timeAmPm;
	
	
		hour=time.getHours();
		minutes=time.getMinutes();
		if (minutes < 10)
		{
			minutes = "0"+minutes;
		}
		if (hour > 12)
		{
			hour = hour-12;
			timeAmPm=hour+":"+minutes+" PM";
		}
		else if (hour ===12)
		{
			timeAmPm=hour+":"+minutes+" PM";
		}
		else{
			timeAmPm=hour+":"+minutes+" AM";
		}
		return timeAmPm;
	
	},
	
	getTodaySummary:function()
	{
		return this.get('daily.summary');
	},
	
	getSunrise:function ()
	{
		var riseTimeText;
		var offset=this.get('offset');
		var riseTime = this.get('today.sunriseTime');
		riseTime= this.getLocalDate(riseTime,offset);
		riseTimeText= this.getTimeAmPm(riseTime);
		return riseTimeText;		
	
	},
	
	 getSunset:function()
	{
		var setTimeText;
		var offset=this.get('offset');
		var setTime = this.get('today.sunsetTime');
		setTime= this.getLocalDate(setTime,offset);
		setTimeText= this.getTimeAmPm(setTime);
	
		return setTimeText;	
	
	},
	
    getRainProbability:function()
	{
		var rains= this.get('current.precipProbability');
		rains = (rains * 100)+"%";
		return rains;	
	
	},
	
	getHumidity:function()
	{
		var humidity= this.get('current.humidity');
		humidity = (humidity * 100).toFixed(2)+"%";
		return humidity;
	
	},
	
	getWindSpeed:function()
	{
		var speed= this.get('current.windSpeed');
		var brng=this.get('current.windBearing');
		var bearingDir;
		var windDetails;
		var bearings = ["NE", "E", "SE", "S", "SW", "W", "NW", "N"];
		var unit=this.get('units');
		var index = brng - 22.5;
		if (index < 0)
		{
			index += 360;
		}
		index = parseInt(index / 45);

		bearingDir=bearings[index];
		if(unit===false)
		{
			speed=(speed * 1.60934).toFixed(2);
			windDetails = speed +" kph "+ bearingDir;
		}
		else
		{
		windDetails = speed +" mph "+ bearingDir;
		}
		return windDetails;
	
	
	},

	/*Function to get the apparent temperature*/
	getFeelsLike:function()
	{
		var temp=parseInt(this.get('current.apparentTemperature'));
		temp=this.formatTemperature(temp);
		return temp;
	
	
	},
	
	
	getPrecipitation:function()
	{
		var precipIntensity=this.get('current.precipIntensity');
		var unit=this.get('units');
		/*get precipitation in mm for SI*/
		if(unit===false)
		{
				precipIntensity=(precipIntensity*25).toFixed(2);
				precipIntensity=precipIntensity+" mm";
		}
	    /*get precipitation in in for US*/
		else
		{
				precipIntensity=precipIntensity+" in";
			}
			
				return precipIntensity;
	
	},
	
	getPressure:function()
	{
		var pressure=this.get('current.pressure');
		var unit=this.get('units');
		/* get pressure in hPa for SI*/
		if(unit===false)
		{
		   pressure = (parseFloat(pressure).toFixed(2))+" hPa";
		}
		/* get pressure in in for US*/
		else
		{
		pressure = (parseFloat(pressure * 0.02952998751).toFixed(2))+" in";
		}
		return pressure;
	},

	/*Function to get the visibility*/
   getVisibility:function()
	{
		var unit=this.get('units');

		var visibility=this.get('current.visibility');
		
		if (visibility===undefined)
		{
			visibility="--";
		}
		/*in Km if units is SI*/
		else if(unit===false)
		{
				visibility=(visibility * 1.60934).toFixed(2);
				visibility=visibility+" km";
		}
		/*in miles if units is US*/
		else{
			visibility=visibility+" mi";
			}
			return visibility;
	
	},
	
	getHourly:function(time,count)
	{

		var offset=this.get('offset');
		var now=this.getLocalDate(time,offset);
		var hour=now.getHours();
		var hourText;
		if(count===0)
		{
			hourText="Now";
		}
		else
		{
			if (hour > 12)
			{
				hour = hour-12;
				hourText=hour+" PM";
			}
			else if (hour === 12)
			{
				hourText=hour+" PM";
			}
			else{
				hourText=hour+" AM";
			}
		}
		return hourText;
	},
	
	getDayofWeek:function()
	{
		var time =this.get('current.time');
		var offset=this.get('offset');
		time=this.getLocalDate(time,offset);
		var day=time.getDay();
		return day;
	},
	
		
});

export default WeatherModel;
