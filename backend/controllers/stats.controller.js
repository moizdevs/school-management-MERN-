import { User } from "../models/user.model.js";
import { Class } from "../models/class.model.js";
import { StudentProfile } from "../models/studentProfile.model.js";

// GET /api/stats/admissions  -> students admitted per month, last 6 months
export const getAdmissionStats = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const data = await User.aggregate([
      { $match: { role: "student", createdAt: { $gte: start } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // fill months with zero so the chart always has 6 bars
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const found = data.find(
        (x) =>
          x._id.year === d.getFullYear() && x._id.month === d.getMonth() + 1,
      );
      result.push({
        label: d.toLocaleString("en", { month: "short", year: "2-digit" }),
        count: found ? found.count : 0,
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/stats/class-distribution -> students per class + section
export const getClassDistributionStats = async (req, res) => {
  try {
    const studentsByClass = await Class.aggregate([
      {
        $lookup: {
          from: StudentProfile.collection.name,
          localField: "_id",
          foreignField: "class",
          as: "students",
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          name: "$className",
          _count: { students: { $size: "$students" } },
        },
      },
    ]);

    studentsByClass.sort((a, b) =>
      String(a.name).localeCompare(String(b.name), undefined, { numeric: true })
    );

    res.status(200).json(studentsByClass);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "An error occurred fetching students by class" });
  }
};