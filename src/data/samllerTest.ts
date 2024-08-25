export const apartmentData: {
    id: string;
    city: string;
    type: string;
    squareMeters: number;
    rooms: number;
    floor: number;
    floorCount: number;
    buildYear: number  | null;
    latitude: number;
    longitude: number;
    centreDistance: number;
    poiCount: number;
    schoolDistance: number;
    clinicDistance: number;
    postOfficeDistance: number;
    kindergartenDistance: number;
    restaurantDistance: number;
    collegeDistance: number | null;
    pharmacyDistance: number;
    ownership: string;
    buildingMaterial: string;
    condition: string  | null;
    hasParkingSpace: "yes" | "no";
    hasBalcony: "yes" | "no";
    hasElevator: "yes" | "no";
    hasSecurity: "yes" | "no";
    hasStorageRoom: "yes" | "no";
    price: number
  }[] = [
    {
      "id":"f8524536d4b09a0c8ccc0197ec9d7bde",
      "city":"Szczecin",
      "type":"blockOfFlats",
      "squareMeters":63.0,
      "rooms":3.0,
      "floor":4.0,
      "floorCount":10.0,
      "buildYear":1980.0,
      "latitude":53.3789332,
      "longitude":14.6252957,
      "centreDistance":6.53,
      "poiCount":9.0,
      "schoolDistance":0.118,
      "clinicDistance":1.389,
      "postOfficeDistance":0.628,
      "kindergartenDistance":0.105,
      "restaurantDistance":1.652,
      "collegeDistance":null,
      "pharmacyDistance":0.413,
      "ownership":"condominium",
      "buildingMaterial":"concreteSlab",
      "condition":null,
      "hasParkingSpace":"yes",
      "hasBalcony":"yes",
      "hasElevator":"yes",
      "hasSecurity":"no",
      "hasStorageRoom":"yes",
      "price":415000
    },
    {
      "id":"accbe77d4b360fea9735f138a50608dd",
      "city":"Szczecin",
      "type":"blockOfFlats",
      "squareMeters":36.0,
      "rooms":2.0,
      "floor":8.0,
      "floorCount":10.0,
      "buildYear":null,
      "latitude":53.442691899,
      "longitude":14.5596899117,
      "centreDistance":2.15,
      "poiCount":16.0,
      "schoolDistance":0.273,
      "clinicDistance":0.492,
      "postOfficeDistance":0.652,
      "kindergartenDistance":0.291,
      "restaurantDistance":0.348,
      "collegeDistance":1.404,
      "pharmacyDistance":0.205,
      "ownership":"cooperative",
      "buildingMaterial":"concreteSlab",
      "condition":null,
      "hasParkingSpace":"no",
      "hasBalcony":"yes",
      "hasElevator":"yes",
      "hasSecurity":"no",
      "hasStorageRoom":"yes",
      "price":395995
    }
]