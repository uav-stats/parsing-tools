import geocode from "./services/Geocoder";
import timezone from "./services/Timezone";
import Promise from "bluebird";

new Promise(resolve => resolve([
	"Los Angeles, CA",
	"Las Vegas, NV",
	"New York, NY",
	"Arleta, CA",
	"Van Nuys, CA",
	"California City, CA",
	"San Francisco, CA",
	"San Diego, CA"
]))
	.map(geocode)
	.map(results => results[0])
	.map(result => {
		console.log("geocode result", result);
		return timezone(result.latitude, result.longitude);
	})
	.map(result => {
		console.log("timezone result", result);
		return result;
	});
