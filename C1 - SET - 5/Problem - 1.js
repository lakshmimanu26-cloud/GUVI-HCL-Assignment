/*{
  _id: ObjectId,
  name: "Rahul Sharma",
  email: "rahul@example.com",
  preferences: ["fiction", "technology"],
  createdAt: ISODate()
}
{
  _id: ObjectId,
  name: "Author Name",
  bio: "Short bio",
  nationality: "Indian"
}
{
  _id: ObjectId,
  title: "MongoDB Basics",
  authorIds: [ObjectId, ObjectId],
  genres: ["technology", "database"],
  publishedYear: 2023,
  totalPages: 350,
  avgRating: 4.5
}
{
  _id: ObjectId,
  userId: ObjectId,
  bookId: ObjectId,
  progress: 60, // percentage
  timeSpentMinutes: 120,
  bookmarks: [
    { page: 45, note: "Important concept" },
    { page: 120, note: "Revise later" }
  ],
  highlights: [
    { page: 50, text: "MongoDB uses BSON format" }
  ],
  lastReadAt: ISODate()
}
{
  _id: ObjectId,
  userId: ObjectId,
  bookId: ObjectId,
  rating: 4,
  comment: "Very useful book!",
  createdAt: ISODate()
}
*/
db.authors.insertMany([
  { name: "John Doe", bio: "Tech writer", nationality: "US" },
  { name: "Jane Smith", bio: "Database expert", nationality: "UK" }
]);
db.books.insertOne({
  title: "MongoDB Mastery",
  authorIds: [
    ObjectId("authorId1"),
    ObjectId("authorId2")
  ],
  genres: ["technology", "database"],
  publishedYear: 2024,
  totalPages: 400
});
db.books.insertOne({
  title: "MongoDB Mastery",
  authorIds: [
    ObjectId("authorId1"),
    ObjectId("authorId2")
  ],
  genres: ["technology", "database"],
  publishedYear: 2024,
  totalPages: 400
});
db.readingActivity.insertOne({
  userId: ObjectId("userId1"),
  bookId: ObjectId("bookId1"),
  progress: 45,
  timeSpentMinutes: 90,
  bookmarks: [
    { page: 30, note: "Important" }
  ],
  highlights: [],
  lastReadAt: new Date()
});
db.readingActivity.findOne(
  {
    userId: ObjectId("userId1"),
    bookId: ObjectId("bookId1")
  },
  {
    progress: 1,
    bookmarks: 1,
    _id: 0
  }
);
db.readingActivity.updateOne(
  {
    userId: ObjectId("userId1"),
    bookId: ObjectId("bookId1")
  },
  {
    $push: {
      bookmarks: {
        page: 75,
        note: "Revisit this section"
      }
    }
  }
);
db.readingActivity.updateOne(
  {
    userId: ObjectId("userId1"),
    bookId: ObjectId("bookId1")
  },
  {
    $push: {
      highlights: {
        page: 80,
        text: "Aggregation pipeline is powerful"
      }
    }
  }
);
db.readingActivity.updateOne(
  {
    userId: ObjectId("userId1"),
    bookId: ObjectId("bookId1")
  },
  {
    $set: {
      progress: 70,
      lastReadAt: new Date()
    }
  }
);
db.readingActivity.aggregate([
  {
    $group: {
      _id: "$bookId",
      readers: { $sum: 1 }
    }
  },
  { $sort: { readers: -1 } },
  { $limit: 5 }
]);
db.readingActivity.aggregate([
  {
    $group: {
      _id: null,
      avgCompletion: { $avg: "$progress" }
    }
  }
]);
db.reviews.aggregate([
  {
    $group: {
      _id: "$bookId",
      avgRating: { $avg: "$rating" },
      totalReviews: { $sum: 1 }
    }
  },
  { $sort: { avgRating: -1 } },
  { $limit: 5 }
]);