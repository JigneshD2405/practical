import Node from "#Node";

export async function load() {
  console.log("DB Connceting..");
  const url = process.env.MONGO_URI;
 
  if (!url) {
    throw new Error("MONGO_URI not found");
  }
 console.log("MOngo URL :-",url);
 
  await Node.Mongoose.connect(url)
    .then(() => {
      console.log("Mongo DB connected");
    })
    .catch(() => {
      console.log("Error in mongodb connection");
    });
}
