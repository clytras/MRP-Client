// module.exports = {
//   /**
//    * Add "global" dependencies for our RN project here so that our local components can resolve their
//    * dependencies correctly
//    */
//   /*extraNodeModules: {
//     react: path.resolve(__dirname, "node_modules/react"),
//     "react-native": path.resolve(__dirname, "node_modules/react-native"),
//     "@storybook": path.resolve(__dirname, "node_modules/@storybook")
//   },*/
//   getProjectRoot() {
//     /**
//      * Add our workspace roots so that react native can find the source code for the included packages
//      * in the monorepo
//      */
//     const projectPath = path.resolve(__dirname);
//     const libPath = path.resolve(__dirname, "../MrPengu-Library");
//     //const componentsPath = path.resolve(__dirname, "../../components");
//     //const rootModulesPath = path.resolve(__dirname, "../../node_modules");

//     return [
//       projectPath,
//       libPath
//       //componentsPath,
//       //rootModulesPath
//     ];
//  }
// }

var path = require("path");
var config = {
  projectRoot: path.resolve(__dirname),
  watchFolders: [
    // Let's add the root folder to the watcher
    // for live reload purpose
    path.resolve(__dirname, "../MrPengu-Library"),
    path.resolve(__dirname, "../MrPengu-Brain")
  ],
  resolver: {
    sourceExts: ['js', 'jsx', 'ts', 'tsx'],
    extraNodeModules: {
      // Here I reference my upper folder
      "mrplib": path.resolve(__dirname, "../MrPengu-Library"),
      "mrpbrain": path.resolve(__dirname, "../MrPengu-Brain/firebase/functions"),
      // Important, those are all the dependencies
      // asked by the "../MrPengu-Library" but which
      // are not present in the ROOT/node_modules
      // So install it in your RN project and reference them here
      // "expo": path.resolve(__dirname, "node_modules/expo"),
      // "lodash.merge": path.resolve(__dirname, "node_modules/lodash.merge"),
      "libphonenumber-js": path.resolve(__dirname, "node_modules/libphonenumber-js"),
      "dinero.js": path.resolve(__dirname, "node_modules/dinero.js"),
      "xregexp": path.resolve(__dirname, "node_modules/xregexp"),
      "qs": path.resolve(__dirname, "node_modules/qs"),
      "nanoid": path.resolve(__dirname, "node_modules/nanoid"),
      "luxon": path.resolve(__dirname, "node_modules/luxon"),
      "react-native-securerandom": path.resolve(__dirname, "node_modules/react-native-securerandom"),
      "lottie-react-native": path.resolve(__dirname, "node_modules/lottie-react-native"),
      "react-native-animated-loader": path.resolve(__dirname, "node_modules/react-native-animated-loader"),
      "react-native-keyboard-aware-scroll-view": path.resolve(__dirname, "node_modules/react-native-keyboard-aware-scroll-view"),
      "react-native-vector-icons": path.resolve(__dirname, "node_modules/react-native-vector-icons"),
      "react-native-material-ripple": path.resolve(__dirname, "node_modules/react-native-material-ripple"),
      "react-native-material-buttons": path.resolve(__dirname, "node_modules/react-native-material-buttons"),
      //"react-native-material-textfield": path.resolve(__dirname, "node_modules/react-native-material-textfield"),
      "react-native-paper": path.resolve(__dirname, "node_modules/react-native-paper"),
      "react-native-awesome-alerts": path.resolve(__dirname, "node_modules/react-native-awesome-alerts"),
      "react-native-localization": path.resolve(__dirname, "node_modules/react-native-localization"),
      "react-native-navigation": path.resolve(__dirname, "node_modules/react-native-navigation"),
      "react-native-svg": path.resolve(__dirname, "node_modules/react-native-svg"),
      "react-native-status-bar-height": path.resolve(__dirname, "node_modules/react-native-status-bar-height"),
      "react-native-google-signin": path.resolve(__dirname, "node_modules/react-native-google-signin"),
      "react-native-fbsdk": path.resolve(__dirname, "node_modules/react-native-fbsdk"),
      "react-native-firebase": path.resolve(__dirname, "node_modules/react-native-firebase"),
      // "reactxp": path.resolve(__dirname, "node_modules/reactxp"),

      "prop-types": path.resolve(__dirname, "node_modules/prop-types"),
      "react-native": path.resolve(__dirname, "node_modules/react-native"),
      "react": path.resolve(__dirname, "node_modules/react"),
      "@babel/runtime": path.resolve(__dirname, "node_modules/@babel/runtime"),
      "@jsassets": path.resolve(__dirname, "./jsassets"),
      "@data": path.resolve(__dirname, "./data"),
      "@components": path.resolve(__dirname, "./components"),
      "@app": path.resolve(__dirname),
    }
  }
}
module.exports = config;
