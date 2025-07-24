function generateLocations(num) {
    var locations = Array.from({ length: num }, function (_, i) {
        return ({
            name: "Location_".concat(i + 1),
            lat: parseFloat((Math.random() * 180 - 90).toFixed(4)),
            lng: parseFloat((Math.random() * 360 - 180).toFixed(4))
        });
    });
    return {
        locations: locations,
        from: "Location_1",
        to: "Location_".concat(num)
    };
}
var jsonRequest = generateLocations(200);
console.log(JSON.stringify(jsonRequest, null, 2));
