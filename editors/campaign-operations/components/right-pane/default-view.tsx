import type { Task } from "../../state/derive-tasks.js";
import type { ActivityEvent } from "../../state/derive-activity.js";
import type { UseRightPaneResult } from "../../state/use-right-pane.js";
import { TasksQueue } from "./tasks-queue.js";
import { ActivityFeed } from "./activity-feed.js";

interface DefaultViewProps {
  tasks: Task[];
  events: ActivityEvent[];
  totalEventCount: number;
  rightPane: UseRightPaneResult;
  onPrimaryAction: (task: Task) => void;
}

export function DefaultView(props: DefaultViewProps) {
  return (
    <div className="defi-united-ops__rp-default">
      <TasksQueue
        tasks={props.tasks}
        rightPane={props.rightPane}
        onPrimaryAction={props.onPrimaryAction}
      />
      <div className="defi-united-ops__rp-glance-placeholder">
        At-a-glance charts arriving in the next task.
      </div>
      <ActivityFeed
        events={props.events}
        totalCount={props.totalEventCount}
        rightPane={props.rightPane}
      />
      <style>{`
        .defi-united-ops__rp-default {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
        }
        .defi-united-ops__rp-glance-placeholder {
          background: #fff;
          border: 1px dashed #d4d7e0;
          border-radius: 12px;
          padding: 16px;
          color: #9aa1ad;
          font-size: 12px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
