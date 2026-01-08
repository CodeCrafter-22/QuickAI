import { clerkClient } from "@clerk/express";

export const userPlan = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // fetch user metadata
    const user = await clerkClient.users.getUser(userId);

    const plan = user.privateMetadata?.plan || "free";
    const free_usage = user.privateMetadata?.free_usage ?? 0;

    // attach to req object so controllers can use it
    req.plan = plan;
    req.free_usage = free_usage;

    next();
  } catch (err) {
    console.log("User plan error:", err);
    res.status(500).json({ success: false, message: "Could not load plan details" });
  }
};
