const { expect } = require('chai');

describe('Application Configuration Tests', function () {

  before(function () {
    // Set test environment variables
    process.env.PORT = '3001';
    process.env.SECRET = 'test_secret_key';
    process.env.BASE_URL = 'http://localhost:3001';
    process.env.ISSUER_BASE_URL = 'https://una-infosec.us.auth0.com/';
    process.env.CLIENT_ID = 'test_client_id';
    process.env.CLIENT_SECRET = 'test_client_secret';
    process.env.REDIRECT_URI = 'http://localhost:3001/dashboard';
  });

  describe('Environment Variables', function () {
    it('should have PORT defined', function () {
      expect(process.env.PORT).to.exist;
      expect(process.env.PORT).to.equal('3001');
    });

    it('should have SECRET defined', function () {
      expect(process.env.SECRET).to.exist;
      expect(process.env.SECRET).to.not.be.empty;
    });

    it('should have BASE_URL defined', function () {
      expect(process.env.BASE_URL).to.exist;
      expect(process.env.BASE_URL).to.match(/^https?:\/\//);
    });

    it('should have ISSUER_BASE_URL defined', function () {
      expect(process.env.ISSUER_BASE_URL).to.exist;
      expect(process.env.ISSUER_BASE_URL).to.include('auth0.com');
    });

    it('should have CLIENT_ID defined', function () {
      expect(process.env.CLIENT_ID).to.exist;
      expect(process.env.CLIENT_ID).to.not.be.empty;
    });

    it('should have CLIENT_SECRET defined', function () {
      expect(process.env.CLIENT_SECRET).to.exist;
      expect(process.env.CLIENT_SECRET).to.not.be.empty;
    });
  });

  describe('Configuration Object', function () {
    it('should create valid auth config object', function () {
      const config = {
        authRequired: false,
        auth0Logout: true,
        secret: process.env.SECRET,
        baseURL: process.env.BASE_URL,
        clientID: process.env.CLIENT_ID,
        issuerBaseURL: process.env.ISSUER_BASE_URL
      };

      expect(config).to.have.property('authRequired').that.is.a('boolean');
      expect(config).to.have.property('auth0Logout').that.is.a('boolean');
      expect(config).to.have.property('secret').that.is.a('string');
      expect(config).to.have.property('baseURL').that.is.a('string');
      expect(config).to.have.property('clientID').that.is.a('string');
      expect(config).to.have.property('issuerBaseURL').that.is.a('string');
    });

    it('should create valid OIDC config object', function () {
      const oidcConfig = {
        issuer: process.env.ISSUER_BASE_URL,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        appBaseUrl: process.env.BASE_URL,
        scope: 'openid profile'
      };

      expect(oidcConfig).to.have.property('issuer');
      expect(oidcConfig).to.have.property('client_id');
      expect(oidcConfig).to.have.property('client_secret');
      expect(oidcConfig).to.have.property('redirect_uri');
      expect(oidcConfig).to.have.property('appBaseUrl');
      expect(oidcConfig).to.have.property('scope').that.includes('openid');
    });
  });
});
