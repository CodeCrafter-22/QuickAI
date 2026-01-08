import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
  try {
    const { userId, has } = await req.auth();
    const hasPremiumPlan = await has({ plan: "premium" });

    const user = await clerkClient.users.getUser(userId);

    if (!hasPremiumPlan) {
      const free = user.privateMetadata.free_usage || 0;

      req.free_usage = free;

      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free
        }
      });
    } else {
      req.free_usage = 0;
    }

    req.plan = hasPremiumPlan ? "premium" : "free";

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
