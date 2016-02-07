import geocoderInit from "node-geocoder";
import makeRateLimited from "./RateLimitCurrier";
import makeCached from "./FileBackedCacheCurrier";

let geocoder = geocoderInit("google", "http");
let rateLimited = makeRateLimited(location => geocoder.geocode(location), 10);
export default makeCached(rateLimited, "geocoder");