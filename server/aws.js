const AWS = require("aws-sdk");

const s3 = new AWS.S3({
    region: "ap-northeast-2",
});

const getSignedUrl = ({ key }) => {
    return new Promise((resolve, reject) => {
        s3.createPresignedPost(
            {
                Bucket: "simple-image-server",
                Fields: {
                    key,
                },
                Expires: 300,
                Conditions: [
                    ["content-length-range", 0, 50 * 1000 * 1000],
                    ["starts-with", "$Content-Type", "image/"],
                ],
            },
            (err, data) => {
                if (err) reject(err);
                resolve(data);
            }
        );
    });
};

module.exports = { s3, getSignedUrl };
