module.exports = {
  servers: {
    one: {
      host: '139.59.246.68',
      username: 'root',
      // pem: "/home/asus/Downloads/moto-accessories.pem"
      password:'moto2017'
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
      ROOT_URL: 'http://139.59.246.68',
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