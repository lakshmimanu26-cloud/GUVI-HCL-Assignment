db.Users.insertMany([
  {
    _id: 1,
    name: "Ravi",
    email: "ravi@gmail.com",
    createdAt: new Date()
  },
  {
    _id: 2,
    name: "Anita",
    email: "anita@gmail.com",
    createdAt: new Date()
  },
  {
    _id: 3,
    name: "John",
    email: "john@gmail.com",
    createdAt: new Date()
  }
]);

db.Items.insertMany([
  {
    _id: 101,
    name: "iPhone 13",
    description: "Used iPhone in good condition",
    category: "Electronics"
  },
  {
    _id: 102,
    name: "Gaming Laptop",
    description: "High performance laptop",
    category: "Electronics"
  }
]);

db.Auctions.insertMany([
  {
    _id: 201,
    itemId: 101,
    sellerId: 1,
    startTime: new Date(),
    endTime: new Date(Date.now() + 86400000), // +1 day
    reservePrice: 30000,
    status: "Active",
    currentHighestBid: 0,
    highestBidder: null
  },
  {
    _id: 202,
    itemId: 102,
    sellerId: 2,
    startTime: new Date(),
    endTime: new Date(Date.now() + 86400000),
    reservePrice: 50000,
    status: "Active",
    currentHighestBid: 0,
    highestBidder: null
  }
]);

db.Bids.insertMany([
  {
    _id: 301,
    auctionId: 201,
    bidderId: 2,
    amount: 32000,
    bidTime: new Date()
  },
  {
    _id: 302,
    auctionId: 201,
    bidderId: 3,
    amount: 35000,
    bidTime: new Date()
  },
  {
    _id: 303,
    auctionId: 202,
    bidderId: 1,
    amount: 55000,
    bidTime: new Date()
  }
]);

db.Auctions.find({}, {
  _id: 1,
  currentHighestBid: 1,
  highestBidder: 1
});

db.Bids.aggregate([
  {
    $group: {
      _id: "$auctionId",
      highestBid: { $max: "$amount" }
    }
  }
]);

const auctionId = 201;
const newBidAmount = 37000;
const bidderId = 1;

const auction = db.Auctions.findOne({ _id: auctionId });

if (
  auction.status === "Active" &&
  newBidAmount > auction.currentHighestBid &&
  new Date() < auction.endTime
) {
  db.Bids.insertOne({
    auctionId,
    bidderId,
    amount: newBidAmount,
    bidTime: new Date()
  });

  db.Auctions.updateOne(
    { _id: auctionId },
    {
      $set: {
        currentHighestBid: newBidAmount,
        highestBidder: bidderId
      }
    }
  );
}

db.Auctions.updateMany(
  {
    endTime: { $lt: new Date() },
    status: "Active"
  },
  [
    {
      $set: {
        status: {
          $cond: [
            { $gte: ["$currentHighestBid", "$reservePrice"] },
            "Completed",
            "Failed"
          ]
        }
      }
    }
  ]
);

db.Bids.aggregate([
  {
    $group: {
      _id: "$bidderId",
      totalBids: { $sum: 1 }
    }
  },
  { $sort: { totalBids: -1 } },
  { $limit: 5 }
]);

db.Bids.aggregate([
  {
    $group: {
      _id: "$auctionId",
      avgBidAmount: { $avg: "$amount" }
    }
  }
]);

db.Auctions.aggregate([
  {
    $match: { status: "Completed" }
  },
  {
    $project: {
      _id: 1,
      revenue: "$currentHighestBid"
    }
  },
  { $sort: { revenue: -1 } }
]);

db.Bids.createIndex({ auctionId: 1, amount: -1 });
db.Auctions.createIndex({ status: 1, endTime: 1 });

db.Auctions.findOneAndUpdate(
  {
    _id: auctionId,
    currentHighestBid: { $lt: newBidAmount },
    status: "Active"
  },
  {
    $set: {
      currentHighestBid: newBidAmount,
      highestBidder: bidderId
    }
  }
);


