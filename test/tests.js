var CryptoJS = require("crypto-js");
var unirest = require("unirest");
var expect  = require("chai").expect;

var key = 'andrew';
var secret = 'andrewsecret';

var date = new Date().toUTCString();

describe("kong", function(done) {
  describe("GET", function(done) {
    it('should return 200 OK', function(done) {
      var signing_string = "date: " + date;
      var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(signing_string, secret));

      unirest.get("http://localhost:8000/")
      .headers({
        "authorization": "hmac username=\"andrew\", algorithm=\"hmac-sha1\", headers=\"date\", signature=\"" + signature + "\"",
        "date": date,
        "host": "headers.jsontest.com"
      }).type("json").send().end(function(response) {
        expect(response.code).to.equal(200);
        done();
      });
    });
  });

  describe("POST", function(done) {
    it('should return 200 OK', function(done) {
      var body = {
        "message": "message_body"
      };

      var content_md5 = CryptoJS.enc.Base64.stringify(CryptoJS.MD5(body));

      var signing_string = "date: " + date + "\ncontent-md5: " + content_md5;
      var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(signing_string, secret));

      unirest.post("http://localhost:8000/")
      .headers({
        "authorization": "hmac username=\"andrew\", algorithm=\"hmac-sha1\", headers=\"date content-md5\", signature=\"" + signature + "\"",
        "content-md5": content_md5,
        "content-type": "application/json",
        "date": date,
        "host": "headers.jsontest.com"
      }).type("json").send(body).end(function(response) {
        expect(response.code).to.equal(200);
        done();
      });
    });
  });
});
