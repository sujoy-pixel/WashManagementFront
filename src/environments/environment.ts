// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: '******************************************',
    authDomain: '******************************************',
    projectId: '******************************************',
    storageBucket: '******************************************',
    messagingSenderId: '******************************************',
    appId: '******************************************',
  },

  //===========Live===========
  apiUrl: 'http://localhost:50297/api/',
  fileUrl: 'http://localhost:50297/',

  //Test
  // apiUrl: 'http://192.168.50.60:86/api/',
  // fileUrl: 'http://192.168.50.60:85/',

  //=========Live==========
  //apiUrl: "https://mis-dining.mascoknit.com/api/",
  //fileUrl: "https://mis-dining.mascoknit.com/",

  //  apiUrl: "https://api.mascoschool.com/api/",
  //  fileUrl: "https://api.mascoschool.com/",

  //reportUrl:"https://localhost:44334/api/",
  apiMapUrl: 'https://api.carcopolo.com/api/custom/v1/',
  apiMapUser: 'st90@commercial.org',
  apiMapPassword: 'mascocommercial',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
