import { CheckCircle, Circle, Plus } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { createTaskAction, toggleTaskAction } from "@/app/actions";
import { getBusinessData } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/sign-in");
  const query = await searchParams;
  const result = await getBusinessData(query.business);
  if (!result.business) redirect("/dashboard");
  const fullName = String(
    data.user.user_metadata?.full_name ||
      data.user.email?.split("@")[0] ||
      "Founder",
  );
  return (
    <AppFrame
      businesses={result.businesses}
      business={result.business}
      businessModules={result.businessModules}
      name={fullName}
      email={data.user.email || ""}
    >
      <section className="page-head">
        <div>
          <p className="eyebrow">Action list</p>
          <h1>Tasks</h1>
          <p>Keep short actions separate from your launch requirements.</p>
        </div>
      </section>
      <div className="split-layout">
        <section className="content-card">
          <div className="section-heading">
            <h2>All tasks</h2>
            <span className="count-pill">{result.tasks.length}</span>
          </div>
          <div className="simple-list">
            {result.tasks.length === 0 && (
              <div className="empty-state">
                <CheckCircle size={34} weight="duotone" />
                <h3>Your task list is clear</h3>
                <p>Add a practical next action to get moving.</p>
              </div>
            )}
            {result.tasks.map((task) => (
              <form
                className={`task-row ${task.status === "Done" ? "done" : ""}`}
                action={toggleTaskAction}
                key={task.id}
              >
                <input type="hidden" name="taskId" value={task.id} />
                <input
                  type="hidden"
                  name="nextStatus"
                  value={task.status === "Done" ? "To do" : "Done"}
                />
                <button
                  aria-label={
                    task.status === "Done"
                      ? `Reopen ${task.title}`
                      : `Complete ${task.title}`
                  }
                >
                  {task.status === "Done" ? (
                    <CheckCircle size={24} weight="fill" />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>
                <div>
                  <b>{task.title}</b>
                  <span>
                    {task.module} · {task.priority} priority
                  </span>
                </div>
              </form>
            ))}
          </div>
        </section>
        <aside className="content-card add-card">
          <h2>
            <Plus size={20} />
            Add task
          </h2>
          <form action={createTaskAction}>
            <input type="hidden" name="businessId" value={result.business.id} />
            <label>
              <span>Task</span>
              <input
                name="title"
                required
                minLength={2}
                placeholder="What needs to happen?"
              />
            </label>
            <label>
              <span>Module</span>
              <select name="module">
                <option>General</option>
                {result.businessModules.map((module) => (
                  <option key={module.id}>{module.module_key}</option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                <span>Priority</span>
                <select name="priority">
                  <option>Medium</option>
                  <option>High</option>
                  <option>Low</option>
                </select>
              </label>
              <label>
                <span>Due date</span>
                <input name="dueDate" type="date" />
              </label>
            </div>
            <button className="btn primary">Add task</button>
          </form>
        </aside>
      </div>
    </AppFrame>
  );
}
