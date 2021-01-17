const withPWA = require("next-pwa");
module.exports = withPWA({
  pwa: {
    dest: "public",
  },
});

const path = require("path");
module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
};

module.exports = {
  // Target must be serverless
  target: "serverless",
};
