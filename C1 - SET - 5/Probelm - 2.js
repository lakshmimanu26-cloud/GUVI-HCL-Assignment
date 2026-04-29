db.Customers.insertMany([
  {
    _id: 1,
    name: "Ravi Kumar",
    email: "ravi@gmail.com",
    phone: "9876543210",
    address: "Bangalore",
    createdAt: new Date()
  },
  {
    _id: 2,
    name: "Anita Sharma",
    email: "anita@gmail.com",
    phone: "9123456780",
    address: "Delhi",
    createdAt: new Date()
  }
]);

db.Policies.insertMany([
  {
    _id: 101,
    customerId: 1,
    type: "Health",
    coverageAmount: 500000,
    premiumAmount: 12000,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2025-01-01"),
    status: "Active"
  },
  {
    _id: 102,
    customerId: 1,
    type: "Vehicle",
    coverageAmount: 300000,
    premiumAmount: 8000,
    startDate: new Date("2024-03-01"),
    endDate: new Date("2025-03-01"),
    status: "Active"
  }
]);

db.PremiumPayments.insertMany([
  {
    _id: 201,
    policyId: 101,
    amount: 12000,
    paymentDate: new Date(),
    method: "UPI",
    status: "Paid"
  },
  {
    _id: 202,
    policyId: 102,
    amount: 8000,
    paymentDate: new Date(),
    method: "Credit Card",
    status: "Paid"
  }
]);

db.Claims.insertMany([
  {
    _id: 301,
    policyId: 101,
    customerId: 1,
    claimAmount: 200000,
    status: "Submitted",
    documents: [
      { name: "Hospital Bill", url: "doc1.pdf" },
      { name: "Medical Report", url: "doc2.pdf" }
    ],
    createdAt: new Date()
  },
  {
    _id: 302,
    policyId: 102,
    customerId: 1,
    claimAmount: 50000,
    status: "Approved",
    documents: [
      { name: "Accident Photo", url: "doc3.pdf" }
    ],
    createdAt: new Date()
  }
]);

db.Claims.aggregate([
  {
    $match: { customerId: 1 }
  },
  {
    $lookup: {
      from: "Policies",
      localField: "policyId",
      foreignField: "_id",
      as: "policyDetails"
    }
  },
  {
    $unwind: "$policyDetails"
  },
  {
    $project: {
      _id: 1,
      claimAmount: 1,
      status: 1,
      policyType: "$policyDetails.type"
    }
  }
]);

db.Claims.updateOne(
  { _id: 301 },
  { $set: { status: "Approved" } }
);

db.Claims.updateOne(
  { _id: 301 },
  { $set: { status: "Settled", settlementAmount: 180000 } }
);

db.Claims.aggregate([
  {
    $lookup: {
      from: "Policies",
      localField: "policyId",
      foreignField: "_id",
      as: "policy"
    }
  },
  { $unwind: "$policy" },
  {
    $group: {
      _id: "$policy.type",
      totalClaimAmount: { $sum: "$claimAmount" }
    }
  }
]);

db.Claims.aggregate([
  {
    $group: {
      _id: "$customerId",
      totalClaims: { $sum: 1 }
    }
  },
  {
    $match: { totalClaims: { $gte: 2 } } // threshold
  }
]);

db.Claims.aggregate([
  {
    $lookup: {
      from: "Policies",
      localField: "policyId",
      foreignField: "_id",
      as: "policy"
    }
  },
  { $unwind: "$policy" },
  {
    $project: {
      customerId: 1,
      claimAmount: 1,
      coverageAmount: "$policy.coverageAmount",
      ratio: { $divide: ["$claimAmount", "$policy.coverageAmount"] }
    }
  },
  {
    $match: {
      ratio: { $gte: 0.8 } // suspicious if >=80% of coverage
    }
  }
]);

db.Claims.createIndex({ customerId: 1 });
db.Claims.createIndex({ policyId: 1 });

statusHistory: [
  { status: "Submitted", date: new Date() }
]

