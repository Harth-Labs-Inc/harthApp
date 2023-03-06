const withPWA = require("next-pwa");
module.exports = withPWA({
    pwa: {
        dest: "public",
        register: true,
        sw: "service-worker.js",
        disable: process.env.NODE_ENV === "development",
    },
});

const path = require("path");
module.exports = {
    sassOptions: {
        includePaths: [path.join(__dirname, "styles")],
    },
};

module.exports = {
    async headers() {
        return [
            {
                // matching all API routes
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
                    },
                ],
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "community-profile-images.s3.us-east-2.amazonaws.com",
            },
            {
                protocol: "https",
                hostname:
                    "topic-message-attachments.s3.us-east-2.amazonaws.com",
            },
            {
                protocol: "https",
                hostname:
                    "gather-message-attachments.s3.us-east-2.amazonaws.com",
            },
        ],
    },
};
