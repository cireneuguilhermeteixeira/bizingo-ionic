const defaultEnvironment = 'dev'
const environment = {
  production: {
    apiUrlWs: 'wss://bizingo-webservice.herokuapp.com/JerseyDemos_war/ws',
  },
  dev: {
    apiUrlWs:'ws://localhost:8080/JerseyDemos_war/ws'
  }
}

export const environmentVars = environment[defaultEnvironment]