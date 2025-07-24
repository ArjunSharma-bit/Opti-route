function generateLocations(num: number): any {
    const locations = Array.from({ length: num }, (_, i) => ({
        name: `Location_${i + 1}`,
        lat: parseFloat((Math.random() * 180 - 90).toFixed(4)), // -90 to 90
        lng: parseFloat((Math.random() * 360 - 180).toFixed(4)), // -180 to 180
    }));
    return {
        locations,
        from: "Location_1",
        to: `Location_${num}`,
    };
}

const jsonRequest = generateLocations(100);
console.log(JSON.stringify(jsonRequest, null, 2));