db.Customers.insertMany([
  {
    _id: 1,
    name: "Ravi Kumar",
    email: "ravi@gmail.com",
    phone: "9876543210",
    createdAt: new Date()
  },
  {
    _id: 2,
    name: "Anita Sharma",
    email: "anita@gmail.com",
    phone: "9123456780",
    createdAt: new Date()
  }
]);

db.Destinations.insertMany([
  {
    _id: 101,
    name: "Goa",
    country: "India",
    season: ["Winter", "Summer"]
  },
  {
    _id: 102,
    name: "Paris",
    country: "France",
    season: ["Spring", "Fall"]
  }
]);

db.Packages.insertMany([
  {
    _id: 201,
    name: "Goa Beach Package",
    destinationId: 101,
    basePrice: 20000,
    inclusions: {
      flight: {
        airline: "IndiGo",
        from: "Bangalore",
        to: "Goa"
      },
      hotel: {
        name: "Beach Resort",
        nights: 3,
        rating: 4
      },
      activities: [
        "Scuba Diving",
        "Cruise Dinner"
      ]
    },
    seasonalPricing: [
      { season: "Winter", multiplier: 1.5 },
      { season: "Summer", multiplier: 1.2 }
    ]
  },
  {
    _id: 202,
    name: "Paris Luxury Trip",
    destinationId: 102,
    basePrice: 120000,
    inclusions: {
      flight: {
        airline: "Air France",
        from: "Delhi",
        to: "Paris"
      },
      hotel: {
        name: "5-Star Hotel",
        nights: 5,
        rating: 5
      },
      activities: [
        "Eiffel Tower Visit",
        "Seine River Cruise"
      ]
    },
    seasonalPricing: [
      { season: "Spring", multiplier: 1.4 }
    ]
  }
]);

db.Bookings.insertMany([
  {
    _id: 301,
    customerId: 1,
    packageId: 201,
    bookingDate: new Date(),
    travelDate: new Date("2026-05-15"),
    status: "Confirmed",
    totalAmount: 30000,
    customizedActivities: ["Scuba Diving"],
    createdAt: new Date()
  },
  {
    _id: 302,
    customerId: 2,
    packageId: 202,
    bookingDate: new Date(),
    travelDate: new Date("2026-06-10"),
    status: "Pending",
    totalAmount: 150000,
    customizedActivities: ["Eiffel Tower Visit"]
  }
]);

db.Reviews.insertMany([
  {
    _id: 401,
    customerId: 1,
    packageId: 201,
    rating: 5,
    comment: "Amazing trip!",
    createdAt: new Date()
  }
]);

db.Bookings.aggregate([
  { $match: { customerId: 1 } },
  {
    $lookup: {
      from: "Packages",
      localField: "packageId",
      foreignField: "_id",
      as: "package"
    }
  },
  { $unwind: "$package" },
  {
    $lookup: {
      from: "Destinations",
      localField: "package.destinationId",
      foreignField: "_id",
      as: "destination"
    }
  },
  { $unwind: "$destination" },
  {
    $project: {
      _id: 1,
      status: 1,
      travelDate: 1,
      totalAmount: 1,
      "package.name": 1,
      "package.inclusions": 1,
      "destination.name": 1,
      customizedActivities: 1
    }
  }
]);

db.Bookings.updateOne(
  { _id: 301 },
  {
    $set: {
      travelDate: new Date("2026-05-20"),
      customizedActivities: ["Scuba Diving", "Cruise Dinner"]
    }
  }
);

db.Bookings.updateOne(
  { _id: 302 },
  { $set: { status: "Confirmed" } }
);

db.Bookings.aggregate([
  {
    $lookup: {
      from: "Packages",
      localField: "packageId",
      foreignField: "_id",
      as: "package"
    }
  },
  { $unwind: "$package" },
  {
    $group: {
      _id: "$package.destinationId",
      totalBookings: { $sum: 1 }
    }
  },
  { $sort: { totalBookings: -1 } }
]);

db.Bookings.aggregate([
  {
    $group: {
      _id: "$packageId",
      totalRevenue: { $sum: "$totalAmount" }
    }
  },
  { $sort: { totalRevenue: -1 } }
]);

db.Bookings.aggregate([
  {
    $project: {
      month: { $month: "$travelDate" }
    }
  },
  {
    $group: {
      _id: "$month",
      totalBookings: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
]);

db.Bookings.createIndex({ customerId: 1 });
db.Bookings.createIndex({ packageId: 1 });
db.Packages.createIndex({ destinationId: 1 });

