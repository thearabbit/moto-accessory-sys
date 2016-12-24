module.exports = {
  servers: {
    one: {
      host: '35.161.248.216',
      username: 'ubuntu',
      pem: "/home/asus/Downloads/moto-accessories.pem"
      // password:
      // or leave blank for authenticate from ssh-agent
    }
  },

  meteor: {
    name: 'Moto',
    path: '../moto-accessory-sys',
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: true,
    },
    env: {
      ROOT_URL: 'http://35.161.248.216',
      MONGO_URL: 'mongodb://localhost/moto'
    },
    dockerImage: 'abernix/meteord:base',
    deployCheckWaitTime: 60
  },

  mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
};