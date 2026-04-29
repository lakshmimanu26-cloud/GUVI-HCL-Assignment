db.Patients.insertMany([
  {
    _id: 1,
    name: "Ravi Kumar",
    age: 45,
    gender: "Male",
    doctor: "Dr. Sharma"
  },
  {
    _id: 2,
    name: "Anita Sharma",
    age: 38,
    gender: "Female",
    doctor: "Dr. Mehta"
  }
]);

db.Devices.insertMany([
  {
    _id: 101,
    patientId: 1,
    type: "Smartwatch",
    brand: "Apple",
    assignedAt: new Date()
  },
  {
    _id: 102,
    patientId: 2,
    type: "Fitness Band",
    brand: "Fitbit",
    assignedAt: new Date()
  }
]);

db.createCollection("HealthMetrics", {
  timeseries: {
    timeField: "timestamp",
    metaField: "metadata",
    granularity: "seconds"
  }
});

db.HealthMetrics.insertMany([
  {
    metadata: { patientId: 1, deviceId: 101 },
    timestamp: new Date("2026-04-29T10:00:00Z"),
    heartRate: 85,
    steps: 100,
    sleepHours: 6
  },
  {
    metadata: { patientId: 1, deviceId: 101 },
    timestamp: new Date("2026-04-29T10:05:00Z"),
    heartRate: 120, // abnormal
    steps: 150,
    sleepHours: 6
  },
  {
    metadata: { patientId: 2, deviceId: 102 },
    timestamp: new Date("2026-04-29T10:00:00Z"),
    heartRate: 72,
    steps: 80,
    sleepHours: 7
  }
]);

db.Alerts.insertMany([
  {
    _id: 201,
    patientId: 1,
    type: "High Heart Rate",
    message: "Heart rate exceeded safe limit",
    value: 120,
    threshold: 100,
    timestamp: new Date(),
    status: "Active"
  }
]);

db.HealthMetrics.find({
  "metadata.patientId": 1,
  timestamp: {
    $gte: new Date("2026-04-29T09:00:00Z"),
    $lte: new Date("2026-04-29T11:00:00Z")
  }
});

const threshold = 100;

db.HealthMetrics.find({
  heartRate: { $gt: threshold }
}).forEach(metric => {
  db.Alerts.insertOne({
    patientId: metric.metadata.patientId,
    type: "High Heart Rate",
    message: "Heart rate exceeded safe limit",
    value: metric.heartRate,
    threshold: threshold,
    timestamp: metric.timestamp,
    status: "Active"
  });
});

db.HealthMetrics.aggregate([
  {
    $group: {
      _id: "$metadata.patientId",
      avgHeartRate: { $avg: "$heartRate" },
      avgSteps: { $avg: "$steps" },
      avgSleep: { $avg: "$sleepHours" }
    }
  }
]);

db.HealthMetrics.aggregate([
  {
    $match: { heartRate: { $gt: 100 } }
  },
  {
    $group: {
      _id: "$metadata.patientId",
      abnormalCount: { $sum: 1 }
    }
  },
  {
    $match: { abnormalCount: { $gte: 2 } }
  }
]);

db.HealthMetrics.aggregate([
  {
    $group: {
      _id: "$metadata.patientId",
      avgHeartRate: { $avg: "$heartRate" },
      avgSleep: { $avg: "$sleepHours" }
    }
  },
  {
    $match: {
      avgHeartRate: { $gt: 95 },
      avgSleep: { $lt: 6 }
    }
  }
]);

db.HealthMetrics.createIndex({ "metadata.patientId": 1, timestamp: 1 });

db.HealthMetrics.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 } // 30 days
);

