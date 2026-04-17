import Node from "#Node";

export const TaskSchema = Node.JOI.object({
  task: Node.JOI.string().min(1).max(500).required(),
  status: Node.JOI.string().optional(),
  assignedTo: Node.JOI.string().required(),
});
export const TaskUpdateSchema = Node.JOI.object({
  status: Node.JOI.string().required(),
});
