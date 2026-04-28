import type { Task } from "../../state/derive-tasks.js";
import type { ActivityEvent } from "../../state/derive-activity.js";
import type { UseRightPaneResult } from "../../state/use-right-pane.js";
import { TasksQueue } from "./tasks-queue.js";
import { ActivityFeed } from "./activity-feed.js";
import { AtAGlance } from "./at-a-glance.js";

interface DefaultViewProps {
  tasks: Task[];
  events: ActivityEvent[];
  totalEventCount: number;
  rightPane: UseRightPaneResult;
  onPrimaryAction: (task: Task) => void;
  // chart inputs:
  raisedEth: number;
  targetEth: number;
  usdLabel: string | null;
  ethLabel: string;
  funnelSegments: {
    status: string;
    amount: number;
    count: number;
    color: string;
  }[];
  cumulativeSeries: { date: string; eth: number; eventLabel?: string }[];
  topContribs: { id: string; name: string; amount: number }[];
  onchainBuckets: { hour: number; count: number; eth: number }[];
}

export function DefaultView(props: DefaultViewProps) {
  return (
    <div className="defi-united-ops__rp-default">
      <TasksQueue
        tasks={props.tasks}
        rightPane={props.rightPane}
        onPrimaryAction={props.onPrimaryAction}
      />
      <AtAGlance
        raisedEth={props.raisedEth}
        targetEth={props.targetEth}
        usdLabel={props.usdLabel}
        ethLabel={props.ethLabel}
        funnelSegments={props.funnelSegments}
        cumulativeSeries={props.cumulativeSeries}
        topContribs={props.topContribs}
        onchainBuckets={props.onchainBuckets}
        rightPane={props.rightPane}
      />
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
      `}</style>
    </div>
  );
}
