export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("[Auto-Scheduler] ⏱️ In-process background timer daemon registered!");

    const { processDueScheduledPosts } = await import("@/lib/scheduler");
    processDueScheduledPosts();

    setInterval(async () => {
      try {
        await processDueScheduledPosts();
      } catch (err) {
        console.error("[Auto-Scheduler Interval Error]:", err);
      }
    }, 30000);
  }
}
