var CryptoJS = require("crypto-js");
var unirest = require("unirest");
var expect  = require("chai").expect;

var key = 'andrew';
var secret = 'andrewsecret';

var date = new Date().toUTCString();

var get = function(date, signature) {
  return unirest.get("http://localhost:8000/")
      .headers({
        "authorization": "hmac username=\"andrew\", algorithm=\"hmac-sha1\", headers=\"date\", signature=\"" + signature + "\"",
        "date": date,
        "host": "headers.jsontest.com"
      }).type("json").send();
};

var getNoHeader = function(date, signature) {
  return unirest.get("http://localhost:8000/")
      .headers({
        "date": date,
        "host": "headers.jsontest.com"
      }).type("json").send();
};

describe("kong", function(done) {
  describe("GET", function(done) {
    it('should return 200 OK', function(done) {
      var signing_string = "date: " + date;
      var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(signing_string, secret));

      get(date, signature).end(function(response) {
        expect(response.code).to.equal(200);
        done();
      });
    });
  });

  describe("bad date", function(done) {
    it('should return a 403 Forbidden', function(done) {
      var badDate = "Mon, 20 Aug 2011 14:38:05 GMT";
      var signing_string = "date: " + badDate;
      var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(signing_string, "badsecret"));

      get(badDate, signature).end(function(response) {
        expect(response.code).to.equal(403);
        done();
      });
    });
  });

  describe("Missing authorization header", function(done) {
    it('should return a 401 Unauthorized', function(done) {
      var signing_string = "date: Mon, 20 Aug 2011 14:38:05 GMT";
      var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(signing_string, secret));

      getNoHeader(date, signature).end(function(response) {
        expect(response.code).to.equal(401);
        done();
      });
    });
  });

  describe("bad signature", function(done) {
    it('should return a 403 Forbidden', function(done) {
      var signing_string = "date: " + date;
      var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(signing_string, "badsecret"));

      get(date, signature).end(function(response) {
        expect(response.code).to.equal(403);
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
