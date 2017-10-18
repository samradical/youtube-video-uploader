const Index = require("./index")
const IDS = ["3DC9Y2BqyuU",]
const BUCKET = `gs://orchard-lane/`
Index(IDS, BUCKET, { save:"videos", itags: ["134"] }).then(r => {
  console.log("--complete--");
  console.log(r)
})
