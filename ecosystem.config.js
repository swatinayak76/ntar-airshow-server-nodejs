module.exports = {
    apps : [
        {
          name: "myapp",
          script: "node server.js",
          watch: true,
          ignore_watch: ["static"],
          env: {
              "PORT": 3000,
              "NODE_ENV": "development",
              "CLIENTID":"1051039380818-or2p4pnu552o0bve070ack0fkh7fjcvu.apps.googleusercontent.com",
              "CLIENTSECRET":"FuIgloBf35aRyk4ufekv0G00",
              "REFRESH_TOKEN":"1/AzqO3Aj7CcH77ekN0wgxkyOXSe1RRq-IAWobNxlE4P0",
              "domain":"http://localhost:4200/",
              "SECRET":"hydraulic_ky_lust_secret_very_secret"
          },
          env_production: {
              "PORT": 3000,
              "NODE_ENV": "production",
              "CLIENTID":"1051039380818-or2p4pnu552o0bve070ack0fkh7fjcvu.apps.googleusercontent.com",
              "CLIENTSECRET":"FuIgloBf35aRyk4ufekv0G00",
              "REFRESH_TOKEN":"1/AzqO3Aj7CcH77ekN0wgxkyOXSe1RRq-IAWobNxlE4P0",
              "domain":"https://hydrauliclust.com/",
              "SECRET":"hydraulic_ky_lust_secret_very_secret"
          }
        }
    ]
  }