const defaultEnvironment = 'dev'
const environment = {
  production: {
    
    apiUrl: 'https://bizingo-webservice.herokuapp.com/JerseyDemos_war/rest',
    apiUrlWs: 'wss://bizingo-webservice.herokuapp.com/JerseyDemos_war/ws',
  },
  dev: {
    apiUrl: 'http://localhost:8080/JerseyDemos_war/rest',
    apiUrlWs:'ws://localhost:8080/JerseyDemos_war/ws'
  }
}

export const environmentVars = environment[defaultEnvironment]