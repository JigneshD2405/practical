import Node from "#Node";

export const UserSchema = Node.JOI.object({
  userName: Node.JOI.string().required(),
  password: Node.JOI.string().required(),
});
