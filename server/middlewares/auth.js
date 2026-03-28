import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    const user = await clerkClient.users.getUser(userId);

    const plan = user.privateMetadata?.plan || "free";
    const free = user.privateMetadata?.free_usage || 0;

    req.plan = plan;
    req.free_usage = free;

    // optional: update free usage (only for free users)
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free
        }
      });
    }

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};