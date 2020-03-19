// Import all of our dependencies
import express = require("express");
import cors = require("cors");
import bodyParser = require("body-parser");

const app = express();
const port = 3000 || process.env.PORT;

// function updateValues(callback: () => void) {
//   callback();
// }

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Handles whenever the root directory of the website is accessed.
app.get("/", function(req: express.Request, res: express.Response) {
  // Respond with Express
  res.send("Hello world!");
});

// // Set app to listen
// app.listen(port, function() {
//   updateValues(function() {
//     console.log(`server is running on port ${port}`);
//   });
// });

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});

