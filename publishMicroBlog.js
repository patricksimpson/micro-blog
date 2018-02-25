exports.publish = function(event, context, callback) {
  const request = require('request');
  const csv = require('csvtojson');
  const AWS = require('aws-sdk');
  const S3 = new AWS.S3();

  const feed = {
    version: 'https://jsonfeed.org/version/1',
    title: "Patrick's Micro Blog",
    home_page_url: 'https://patricksimpson.me/',
    feed_url:
      'https://s3.us-east-2.amazonaws.com/patrick-micro-blog/micro.json',
    items: []
  };

  const URL = process.env.googleURL;
  const fileName = process.env.key;
  const bucketName = process.env.bucketName;

  csv()
    .fromStream(request.get(URL))
    .on('csv', ([id, date, content]) => {
      // BUG IN Node 6 need to manually add 5 hours to my posts!
      var time = new Date(date);
      time.setHours(time.getHours() + 5);
      item = {
        id: id,
        date_published: time.toISOString(),
        content_html: content
      };
      feed.items.push(item);
    })
    .on('done', error => {
      console.log(feed);
      S3.putObject(
        {
          Bucket: bucketName,
          Key: fileName,
          Body: JSON.stringify(feed),
          ACL: 'public-read',
          ContentType: 'application/json'
        },
        function(err, data) {
          console.log(err, data);
          callback(null, data);
        }
      );
    });
};
